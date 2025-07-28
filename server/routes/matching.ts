import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Apprenticeship } from '../models/Apprenticeship';
import { Application } from '../models/Application';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/matching/recommendations - Get personalized job recommendations for student
router.get('/recommendations', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, page = 1 } = req.query;

    // Get user profile
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can get job recommendations'
      });
    }

    // Get user's applications to exclude already applied jobs
    const userApplications = await Application.find({
      userId,
      status: { $in: ['pending', 'reviewed', 'accepted'] }
    }).select('apprenticeshipId').lean();

    const appliedJobIds = userApplications.map(app => app.apprenticeshipId);

    // Build matching query based on user preferences
    const matchQuery: any = {
      isActive: true,
      moderationStatus: 'approved',
      _id: { $nin: appliedJobIds }
    };

    // Industry preference filter
    if (user.profile?.preferences?.industries?.length > 0) {
      matchQuery.industry = { $in: user.profile.preferences.industries };
    }

    // Work type preference
    if (user.profile?.workType) {
      matchQuery.$or = [
        { workType: user.profile.workType },
        { workType: 'both' },
        ...(user.profile.workType !== 'both' ? [{ workType: user.profile.workType }] : [])
      ];
    }

    // Salary range filter
    if (user.profile?.preferences?.salaryRange) {
      const { min: userSalaryMin, max: userSalaryMax } = user.profile.preferences.salaryRange;

      if (userSalaryMin || userSalaryMax) {
        matchQuery.$and = matchQuery.$and || [];

        if (userSalaryMin) {
          matchQuery.$and.push({ 'salary.max': { $gte: userSalaryMin } });
        }
        if (userSalaryMax) {
          matchQuery.$and.push({ 'salary.min': { $lte: userSalaryMax } });
        }
      }
    }

    // Location-based filter
    if (user.profile?.location?.coordinates && user.profile?.preferences?.maxDistance) {
      matchQuery['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.profile.location.coordinates
          },
          $maxDistance: user.profile.preferences.maxDistance * 1000 // Convert km to meters
        }
      };
    }

    // Get matching apprenticeships
    const apprenticeships = await Apprenticeship.find(matchQuery)
      .populate('companyId', 'profile.companyName profile.industry profile.location')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Calculate match scores for each apprenticeship
    const apprenticeshipsWithScores = apprenticeships.map(job => {
      const matchScore = calculateMatchScore(user.profile, job);
      const distance = user.profile?.location?.coordinates && job.location?.coordinates ?
        calculateDistance(user.profile.location.coordinates, job.location.coordinates) : null;

      return {
        ...job,
        matchScore,
        distance,
        matchReasons: generateMatchReasons(user.profile, job)
      };
    });

    // Sort by match score (highest first)
    apprenticeshipsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    const total = await Apprenticeship.countDocuments(matchQuery);

    res.json({
      success: true,
      data: apprenticeshipsWithScores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      details: error.message
    });
  }
});

// GET /api/matching/candidates - Get matched candidates for company's jobs
router.get('/candidates', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { apprenticeshipId, limit = 20, page = 1, minMatchScore = 50 } = req.query;

    // Verify user is a company
    const company = await User.findById(userId);
    if (!company || company.role !== 'company') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can view candidate matches'
      });
    }

    let apprenticeshipQuery: any = {
      companyId: userId,
      isActive: true
    };

    // If specific apprenticeship requested, filter to that
    if (apprenticeshipId) {
      apprenticeshipQuery._id = apprenticeshipId;
    }

    // Get company's apprenticeships
    const apprenticeships = await Apprenticeship.find(apprenticeshipQuery).lean();

    if (apprenticeships.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
      });
    }

    const apprenticeshipIds = apprenticeships.map(job => job._id);

    // Get students who haven't applied to these jobs yet
    const existingApplications = await Application.find({
      apprenticeshipId: { $in: apprenticeshipIds },
      status: { $in: ['pending', 'reviewed', 'accepted'] }
    }).select('userId').lean();

    const appliedUserIds = existingApplications.map(app => app.userId);

    // Find active students
    const students = await User.find({
      role: 'student',
      isActive: true,
      _id: { $nin: appliedUserIds }
    })
      .select('profile email createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Calculate match scores for each student against each job
    const candidatesWithMatches = [];

    for (const student of students) {
      const studentMatches = apprenticeships.map(job => {
        const matchScore = calculateMatchScore(student.profile, job);
        return {
          apprenticeshipId: job._id,
          jobTitle: job.jobTitle,
          matchScore,
          matchReasons: generateMatchReasons(student.profile, job)
        };
      });

      // Get the best match for this student
      const bestMatch = studentMatches.reduce((best, current) =>
        current.matchScore > best.matchScore ? current : best
      );

      // Only include if match score meets minimum threshold
      if (bestMatch.matchScore >= parseInt(minMatchScore)) {
        candidatesWithMatches.push({
          student: {
            _id: student._id,
            email: student.email,
            profile: student.profile,
            memberSince: student.createdAt
          },
          bestMatch,
          allMatches: studentMatches
        });
      }
    }

    // Sort by best match score
    candidatesWithMatches.sort((a, b) => b.bestMatch.matchScore - a.bestMatch.matchScore);

    const total = await User.countDocuments({
      role: 'student',
      isActive: true,
      _id: { $nin: appliedUserIds }
    });

    res.json({
      success: true,
      data: candidatesWithMatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting candidate matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get candidate matches',
      details: error.message
    });
  }
});

// POST /api/matching/invite - Invite a candidate to apply
router.post('/invite', authenticateToken, async (req: any, res: any) => {
  try {
    const companyId = req.user.userId;
    const { studentId, apprenticeshipId, message } = req.body;

    // Verify company ownership
    const company = await User.findById(companyId);
    if (!company || company.role !== 'company') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can send invitations'
      });
    }

    // Verify apprenticeship belongs to company
    const apprenticeship = await Apprenticeship.findOne({
      _id: apprenticeshipId,
      companyId,
      isActive: true
    });

    if (!apprenticeship) {
      return res.status(404).json({
        success: false,
        error: 'Apprenticeship not found or access denied'
      });
    }

    // Verify student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if student already applied
    const existingApplication = await Application.findOne({
      userId: studentId,
      apprenticeshipId,
      status: { $in: ['pending', 'reviewed', 'accepted'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'Student has already applied to this position'
      });
    }

    // Here you would typically create an invitation record and send notification
    // For now, we'll just create a special application with "invited" status
    const invitationApplication = new Application({
      userId: studentId,
      apprenticeshipId,
      companyId,
      status: 'invited',
      submittedAt: new Date(),
      invitedAt: new Date(),
      invitationMessage: message,
      matchScore: calculateMatchScore(student.profile, apprenticeship)
    });

    await invitationApplication.save();

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: invitationApplication
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation',
      details: error.message
    });
  }
});

// GET /api/matching/analytics - Get matching analytics
router.get('/analytics', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let analytics: any = {};

    if (userRole === 'student') {
      // Student analytics
      const user = await User.findById(userId);

      // Get user's application stats
      const applicationStats = await Application.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgMatchScore: { $avg: '$matchScore' }
          }
        }
      ]);

      // Get industry interest based on applications
      const industryInterest = await Application.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'apprenticeships',
            localField: 'apprenticeshipId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $group: {
            _id: '$job.industry',
            applications: { $sum: 1 },
            avgMatchScore: { $avg: '$matchScore' }
          }
        },
        { $sort: { applications: -1 } }
      ]);

      analytics = {
        profile: {
          completeness: calculateProfileCompleteness(user.profile),
          skills: user.profile?.skills?.length || 0,
          preferences: user.profile?.preferences ? 'set' : 'not_set'
        },
        applications: formatApplicationStats(applicationStats),
        industryInterest: industryInterest.slice(0, 5), // Top 5 industries
        recommendations: {
          available: await Apprenticeship.countDocuments({
            isActive: true,
            moderationStatus: 'approved'
          })
        }
      };

    } else if (userRole === 'company') {
      // Company analytics
      const jobStats = await Apprenticeship.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 },
            totalApplications: { $sum: '$applicationCount' },
            totalViews: { $sum: '$viewCount' }
          }
        }
      ]);

      const applicationStats = await Application.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgMatchScore: { $avg: '$matchScore' }
          }
        }
      ]);

      analytics = {
        jobs: formatJobStats(jobStats),
        applications: formatApplicationStats(applicationStats),
        performance: {
          averageApplicationsPerJob: jobStats.length > 0 ?
            jobStats.reduce((sum, stat) => sum + (stat.totalApplications || 0), 0) / jobStats.length : 0,
          averageViewsPerJob: jobStats.length > 0 ?
            jobStats.reduce((sum, stat) => sum + (stat.totalViews || 0), 0) / jobStats.length : 0
        }
      };
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error getting matching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
      details: error.message
    });
  }
});

// Helper function to calculate match score (same as in applications.ts)
function calculateMatchScore(userProfile: any, apprenticeship: any): number {
  let score = 0;
  let factors = 0;

  // Skills matching (40% weight)
  if (userProfile.skills && apprenticeship.skills) {
    const userSkills = userProfile.skills.map((s: string) => s.toLowerCase());
    const jobSkills = apprenticeship.skills.map((s: any) =>
      typeof s === 'string' ? s.toLowerCase() : s.skill?.toLowerCase()
    ).filter(Boolean);

    const matchingSkills = userSkills.filter((skill: string) =>
      jobSkills.some((jobSkill: string) => jobSkill.includes(skill) || skill.includes(jobSkill))
    );

    if (jobSkills.length > 0) {
      score += (matchingSkills.length / jobSkills.length) * 40;
      factors++;
    }
  }

  // Location matching (20% weight)
  if (userProfile.location?.coordinates && apprenticeship.location?.coordinates) {
    const distance = calculateDistance(
      userProfile.location.coordinates,
      apprenticeship.location.coordinates
    );

    if (distance <= 10) score += 20;
    else if (distance <= 25) score += 15;
    else if (distance <= 50) score += 10;
    else score += 5;

    factors++;
  }

  // Work type matching (15% weight)
  if (userProfile.workType && apprenticeship.workType) {
    if (userProfile.workType === apprenticeship.workType ||
      userProfile.workType === 'both' ||
      apprenticeship.workType === 'both') {
      score += 15;
    }
    factors++;
  }

  // Salary expectations (15% weight)
  if (userProfile.preferences?.salaryRange && apprenticeship.salary) {
    const userMin = userProfile.preferences.salaryRange.min || 0;
    const userMax = userProfile.preferences.salaryRange.max || 100000;
    const jobMin = apprenticeship.salary.min || 0;
    const jobMax = apprenticeship.salary.max || 100000;

    if (jobMax >= userMin && userMax >= jobMin) {
      score += 15;
    } else {
      const gap = Math.min(Math.abs(jobMax - userMin), Math.abs(userMax - jobMin));
      if (gap <= 5000) score += 10;
      else if (gap <= 10000) score += 5;
    }
    factors++;
  }

  // Industry preference (10% weight)
  if (userProfile.preferences?.industries && apprenticeship.industry) {
    const userIndustries = userProfile.preferences.industries.map((i: string) => i.toLowerCase());
    if (userIndustries.includes(apprenticeship.industry.toLowerCase())) {
      score += 10;
    }
    factors++;
  }

  return factors > 0 ? Math.round(score) : 50;
}

// Helper function to calculate distance
function calculateDistance(coords1: number[], coords2: number[]): number {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

// Helper function to generate match reasons
function generateMatchReasons(userProfile: any, apprenticeship: any): string[] {
  const reasons = [];

  // Skills match
  if (userProfile.skills && apprenticeship.skills) {
    const userSkills = userProfile.skills.map((s: string) => s.toLowerCase());
    const jobSkills = apprenticeship.skills.map((s: any) =>
      typeof s === 'string' ? s.toLowerCase() : s.skill?.toLowerCase()
    ).filter(Boolean);

    const matchingSkills = userSkills.filter((skill: string) =>
      jobSkills.some((jobSkill: string) => jobSkill.includes(skill) || skill.includes(jobSkill))
    );

    if (matchingSkills.length > 0) {
      reasons.push(`Skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
  }

  // Location match
  if (userProfile.location?.coordinates && apprenticeship.location?.coordinates) {
    const distance = calculateDistance(
      userProfile.location.coordinates,
      apprenticeship.location.coordinates
    );

    if (distance <= 25) {
      reasons.push(`Close location: ${distance}km away`);
    }
  }

  // Industry match
  if (userProfile.preferences?.industries && apprenticeship.industry) {
    const userIndustries = userProfile.preferences.industries.map((i: string) => i.toLowerCase());
    if (userIndustries.includes(apprenticeship.industry.toLowerCase())) {
      reasons.push(`Industry preference: ${apprenticeship.industry}`);
    }
  }

  // Salary match
  if (userProfile.preferences?.salaryRange && apprenticeship.salary) {
    const userMin = userProfile.preferences.salaryRange.min || 0;
    const userMax = userProfile.preferences.salaryRange.max || 100000;
    const jobMin = apprenticeship.salary.min || 0;
    const jobMax = apprenticeship.salary.max || 100000;

    if (jobMax >= userMin && userMax >= jobMin) {
      reasons.push(`Salary range fits expectations`);
    }
  }

  return reasons.slice(0, 3); // Return top 3 reasons
}

// Helper functions for analytics formatting
function formatApplicationStats(stats: any[]): any {
  const formatted = {
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0,
    invited: 0,
    averageMatchScore: 0
  };

  stats.forEach(stat => {
    formatted[stat._id] = stat.count;
    formatted.total += stat.count;
    if (stat.avgMatchScore) {
      formatted.averageMatchScore = Math.round(stat.avgMatchScore);
    }
  });

  return formatted;
}

function formatJobStats(stats: any[]): any {
  const active = stats.find(s => s._id === true) || { count: 0, totalApplications: 0, totalViews: 0 };
  const inactive = stats.find(s => s._id === false) || { count: 0, totalApplications: 0, totalViews: 0 };

  return {
    active: active.count,
    inactive: inactive.count,
    total: active.count + inactive.count,
    totalApplications: active.totalApplications || 0,
    totalViews: active.totalViews || 0
  };
}

function calculateProfileCompleteness(profile: any): number {
  if (!profile) return 0;

  const fields = [
    'firstName', 'lastName', 'bio', 'skills', 'location',
    'workType', 'transportModes', 'preferences'
  ];

  const completedFields = fields.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return value && Object.keys(value).length > 0;
    return value;
  });

  return Math.round((completedFields.length / fields.length) * 100);
}

export default router;