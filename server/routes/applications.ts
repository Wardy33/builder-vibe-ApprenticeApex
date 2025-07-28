import express from 'express';
import mongoose from 'mongoose';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { Apprenticeship } from '../models/Apprenticeship';
import { authenticateToken } from '../middleware/auth';
import { validateDatabaseInput } from '../middleware/database';

const router = express.Router();

// GET /api/applications - Get user's applications (student) or received applications (company)
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { status, page = 1, limit = 20, sort = '-submittedAt' } = req.query;

    let query: any = {};
    let populateFields = '';

    if (userRole === 'student') {
      // Student: get their applications
      query.userId = userId;
      populateFields = 'apprenticeshipId companyId';
    } else if (userRole === 'company') {
      // Company: get applications to their jobs
      query.companyId = userId;
      populateFields = 'userId apprenticeshipId';
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('userId', 'profile.firstName profile.lastName profile.skills profile.location email')
      .populate('apprenticeshipId', 'jobTitle industry location salary')
      .populate('companyId', 'profile.companyName profile.industry')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      details: error.message
    });
  }
});

// POST /api/applications - Submit new application
router.post('/', authenticateToken, validateDatabaseInput('applications'), async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { apprenticeshipId, coverLetter, additionalInfo } = req.body;

    // Verify user is a student
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can submit applications'
      });
    }

    // Verify apprenticeship exists and is active
    const apprenticeship = await Apprenticeship.findById(apprenticeshipId).populate('companyId');
    if (!apprenticeship || !apprenticeship.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Apprenticeship not found or no longer active'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      userId,
      apprenticeshipId,
      status: { $in: ['pending', 'reviewed', 'accepted'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this apprenticeship'
      });
    }

    // Calculate match score based on user profile and job requirements
    const matchScore = calculateMatchScore(user.profile, apprenticeship);

    // Create application
    const applicationData = {
      userId,
      apprenticeshipId,
      companyId: apprenticeship.companyId._id,
      status: 'pending',
      submittedAt: new Date(),
      coverLetter,
      additionalInfo,
      matchScore,
      applicationData: {
        userProfile: {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          skills: user.profile.skills,
          location: user.profile.location,
          workType: user.profile.workType,
          hasDriversLicense: user.profile.hasDriversLicense
        }
      }
    };

    const application = new Application(applicationData);
    await application.save();

    // Update apprenticeship application count
    await Apprenticeship.findByIdAndUpdate(apprenticeshipId, {
      $inc: { applicationCount: 1 }
    });

    // Populate the created application for response
    const populatedApplication = await Application.findById(application._id)
      .populate('apprenticeshipId', 'jobTitle industry location')
      .populate('companyId', 'profile.companyName')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedApplication,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// GET /api/applications/:id - Get single application details
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID'
      });
    }

    const application = await Application.findById(id)
      .populate('userId', 'profile email')
      .populate('apprenticeshipId')
      .populate('companyId', 'profile.companyName profile.industry')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check access permissions
    const hasAccess =
      (userRole === 'student' && application.userId._id.toString() === userId) ||
      (userRole === 'company' && application.companyId._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application',
      details: error.message
    });
  }
});

// PUT /api/applications/:id/status - Update application status (company only)
router.put('/:id/status', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'company') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can update application status'
      });
    }

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID'
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Verify company owns this application
    if (application.companyId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update applications to your jobs'
      });
    }

    // Update application
    const updateData: any = {
      status,
      lastStatusChange: new Date()
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (status === 'reviewed') {
      updateData.reviewedAt = new Date();
    } else if (status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'profile.firstName profile.lastName email')
      .populate('apprenticeshipId', 'jobTitle');

    res.json({
      success: true,
      data: updatedApplication,
      message: `Application ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status',
      details: error.message
    });
  }
});

// GET /api/applications/stats/overview - Get application statistics
router.get('/stats/overview', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let matchCondition: any = {};

    if (userRole === 'student') {
      matchCondition.userId = new mongoose.Types.ObjectId(userId);
    } else if (userRole === 'company') {
      matchCondition.companyId = new mongoose.Types.ObjectId(userId);
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const stats = await Application.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgMatchScore: { $avg: '$matchScore' }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      averageMatchScore: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      if (stat.avgMatchScore) {
        formattedStats.averageMatchScore = Math.round(stat.avgMatchScore);
      }
    });

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application statistics',
      details: error.message
    });
  }
});

// DELETE /api/applications/:id - Withdraw application (student only)
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can withdraw applications'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID'
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Verify student owns this application
    if (application.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only withdraw your own applications'
      });
    }

    // Check if application can be withdrawn
    if (application.status === 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Cannot withdraw an accepted application'
      });
    }

    // Soft delete by updating status
    await Application.findByIdAndUpdate(id, {
      status: 'withdrawn',
      withdrawnAt: new Date(),
      lastStatusChange: new Date()
    });

    // Decrease application count on apprenticeship
    await Apprenticeship.findByIdAndUpdate(application.apprenticeshipId, {
      $inc: { applicationCount: -1 }
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw application',
      details: error.message
    });
  }
});

// Helper function to calculate match score
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

    // Score based on distance (closer = higher score)
    if (distance <= 10) score += 20; // Within 10km
    else if (distance <= 25) score += 15; // Within 25km
    else if (distance <= 50) score += 10; // Within 50km
    else score += 5; // Further than 50km

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

    // Check if ranges overlap
    if (jobMax >= userMin && userMax >= jobMin) {
      score += 15;
    } else {
      // Partial score based on how close the ranges are
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

  // Return weighted average or raw score
  return factors > 0 ? Math.round(score) : 50; // Default to 50% if no factors to compare
}

// Helper function to calculate distance between coordinates
function calculateDistance(coords1: number[], coords2: number[]): number {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}