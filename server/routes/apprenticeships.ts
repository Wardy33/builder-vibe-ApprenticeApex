import express from 'express';
import mongoose from 'mongoose';
import { Apprenticeship } from '../models/Apprenticeship';
import { User } from '../models/User';
import { Application } from '../models/Application';
import { authenticateToken } from '../middleware/auth';
import { validateDatabaseInput } from '../middleware/database';

const router = express.Router();

// GET /api/apprenticeships/discover - Get apprenticeships for student browsing
router.get('/discover', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const {
      industry,
      location,
      maxDistance = 50000, // 50km default
      salaryMin,
      salaryMax,
      workType,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Get user's location for distance-based search
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Build query filters
    const filters: any = {
      isActive: true,
      moderationStatus: 'approved'
    };

    // Industry filter
    if (industry) {
      filters.industry = industry;
    }

    // Work type filter
    if (workType) {
      filters.workType = workType;
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      filters['salary.min'] = {};
      if (salaryMin) filters['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) filters['salary.max'] = { $lte: parseInt(salaryMax) };
    }

    // Location-based search
    if (location || user.profile?.location?.coordinates) {
      const searchCoords = location ?
        JSON.parse(location) :
        user.profile.location.coordinates;

      if (searchCoords && Array.isArray(searchCoords)) {
        filters['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: searchCoords
            },
            $maxDistance: parseInt(maxDistance)
          }
        };
      }
    }

    // Get apprenticeships with pagination
    const apprenticeships = await Apprenticeship.find(filters)
      .populate('companyId', 'profile.companyName profile.industry profile.location')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Apprenticeship.countDocuments(filters);

    // Get user's existing applications to mark applied jobs
    const userApplications = await Application.find({
      userId,
      status: { $in: ['pending', 'reviewed', 'accepted'] }
    }).select('apprenticeshipId').lean();

    const appliedJobIds = userApplications.map(app => app.apprenticeshipId.toString());

    // Add application status to each job
    const apprenticeshipsWithStatus = apprenticeships.map(job => ({
      ...job,
      hasApplied: appliedJobIds.includes(job._id.toString()),
      distance: job.location?.coordinates && user.profile?.location?.coordinates ?
        calculateDistance(
          user.profile.location.coordinates,
          job.location.coordinates
        ) : null
    }));

    res.json({
      success: true,
      data: apprenticeshipsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching apprenticeships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch apprenticeships',
      details: error.message
    });
  }
});

// POST /api/apprenticeships/swipe - Handle swipe actions
router.post('/swipe', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { apprenticeshipId, action } = req.body; // action: 'like' or 'pass'

    if (!apprenticeshipId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Apprenticeship ID and action are required'
      });
    }

    // Verify apprenticeship exists
    const apprenticeship = await Apprenticeship.findById(apprenticeshipId);
    if (!apprenticeship) {
      return res.status(404).json({
        success: false,
        error: 'Apprenticeship not found'
      });
    }

    // Update swipe stats
    if (action === 'like') {
      await Apprenticeship.findByIdAndUpdate(apprenticeshipId, {
        $inc: {
          'swipeStats.totalSwipes': 1,
          'swipeStats.rightSwipes': 1
        }
      });
    } else if (action === 'pass') {
      await Apprenticeship.findByIdAndUpdate(apprenticeshipId, {
        $inc: {
          'swipeStats.totalSwipes': 1,
          'swipeStats.leftSwipes': 1
        }
      });
    }

    // If user liked the job, create a potential application intent
    if (action === 'like') {
      // You could store this as user interest for future matching
      await User.findByIdAndUpdate(userId, {
        $addToSet: { 'profile.interestedJobs': apprenticeshipId }
      });
    }

    res.json({
      success: true,
      message: `Swipe ${action} recorded successfully`
    });

  } catch (error) {
    console.error('Error handling swipe:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process swipe',
      details: error.message
    });
  }
});

// GET /api/apprenticeships/search - Advanced search with filters
router.get('/search', async (req: any, res: any) => {
  try {
    const {
      q, // search query
      industry,
      location,
      maxDistance = 50000,
      salaryMin,
      salaryMax,
      workType,
      apprenticeshipLevel,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const filters: any = {
      isActive: true,
      moderationStatus: 'approved'
    };

    // Text search
    if (q) {
      filters.$text = { $search: q };
    }

    // Apply other filters (same as discover endpoint)
    if (industry) filters.industry = industry;
    if (workType) filters.workType = workType;
    if (apprenticeshipLevel) filters.apprenticeshipLevel = apprenticeshipLevel;

    if (salaryMin || salaryMax) {
      filters['salary.min'] = {};
      if (salaryMin) filters['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) filters['salary.max'] = { $lte: parseInt(salaryMax) };
    }

    // Location search
    if (location) {
      const coords = JSON.parse(location);
      if (coords && Array.isArray(coords)) {
        filters['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coords
            },
            $maxDistance: parseInt(maxDistance)
          }
        };
      }
    }

    const apprenticeships = await Apprenticeship.find(filters)
      .populate('companyId', 'profile.companyName profile.industry profile.location')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await Apprenticeship.countDocuments(filters);

    res.json({
      success: true,
      data: apprenticeships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error searching apprenticeships:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
});

// GET /api/apprenticeships/:id - Get single apprenticeship details
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid apprenticeship ID'
      });
    }

    const apprenticeship = await Apprenticeship.findById(id)
      .populate('companyId', 'profile.companyName profile.industry profile.location profile.description')
      .lean();

    if (!apprenticeship) {
      return res.status(404).json({
        success: false,
        error: 'Apprenticeship not found'
      });
    }

    // Increment view count
    await Apprenticeship.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 }
    });

    res.json({
      success: true,
      data: apprenticeship
    });

  } catch (error) {
    console.error('Error fetching apprenticeship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch apprenticeship',
      details: error.message
    });
  }
});

// POST /api/apprenticeships - Create new apprenticeship (for companies)
router.post('/', authenticateToken, validateDatabaseInput('apprenticeships'), async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || user.role !== 'company') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can create apprenticeships'
      });
    }

    const apprenticeshipData = {
      ...req.body,
      companyId: userId,
      createdBy: userId,
      lastModifiedBy: userId,
      isActive: true,
      moderationStatus: 'pending',
      publishedAt: new Date()
    };

    const apprenticeship = new Apprenticeship(apprenticeshipData);
    await apprenticeship.save();

    res.status(201).json({
      success: true,
      data: apprenticeship,
      message: 'Apprenticeship created successfully'
    });

  } catch (error) {
    console.error('Error creating apprenticeship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create apprenticeship',
      details: error.message
    });
  }
});

// PUT /api/apprenticeships/:id - Update apprenticeship
router.put('/:id', authenticateToken, validateDatabaseInput('apprenticeships'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid apprenticeship ID'
      });
    }

    const apprenticeship = await Apprenticeship.findById(id);
    if (!apprenticeship) {
      return res.status(404).json({
        success: false,
        error: 'Apprenticeship not found'
      });
    }

    // Check ownership
    if (apprenticeship.companyId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own apprenticeships'
      });
    }

    const updatedData = {
      ...req.body,
      lastModifiedBy: userId,
      lastModifiedAt: new Date()
    };

    const updatedApprenticeship = await Apprenticeship.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedApprenticeship,
      message: 'Apprenticeship updated successfully'
    });

  } catch (error) {
    console.error('Error updating apprenticeship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update apprenticeship',
      details: error.message
    });
  }
});

// DELETE /api/apprenticeships/:id - Delete apprenticeship
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid apprenticeship ID'
      });
    }

    const apprenticeship = await Apprenticeship.findById(id);
    if (!apprenticeship) {
      return res.status(404).json({
        success: false,
        error: 'Apprenticeship not found'
      });
    }

    // Check ownership
    if (apprenticeship.companyId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own apprenticeships'
      });
    }

    // Soft delete by marking as inactive
    await Apprenticeship.findByIdAndUpdate(id, {
      isActive: false,
      deletedAt: new Date(),
      lastModifiedBy: userId
    });

    res.json({
      success: true,
      message: 'Apprenticeship deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting apprenticeship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete apprenticeship',
      details: error.message
    });
  }
});

// Helper function to calculate distance between two coordinates
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

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

export default router;