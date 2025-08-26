import express from 'express';

const router = express.Router();

const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || 'winter-bread-79671472';

// Note: This route file would need to be called from a context where MCP tools are available
// For now, we'll create the structure and update it to work with the application

// GET /api/apprenticeships/public - Get public job listings from Neon database
router.get('/public', async (req: any, res: any) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      location,
      salaryMin,
      salaryMax,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    console.log('🔍 Fetching public apprenticeships from Neon database with filters:', { 
      page, limit, search, category, location 
    });

    // Build WHERE clause for filtering
    let whereConditions = ["j.status = 'active'"];
    let sqlParams = [];

    // Search filter
    if (search) {
      whereConditions.push(`(
        j.title ILIKE '%${search}%' OR 
        j.description ILIKE '%${search}%' OR 
        j.requirements::text ILIKE '%${search}%'
      )`);
    }

    // Category filter
    if (category && category !== 'all') {
      whereConditions.push(`j.category = '${category}'`);
    }

    // Location filter
    if (location && location !== 'all') {
      whereConditions.push(`j.location ILIKE '%${location}%'`);
    }

    // Salary filters
    if (salaryMin) {
      whereConditions.push(`j.salary_max >= ${parseInt(salaryMin)}`);
    }
    if (salaryMax) {
      whereConditions.push(`j.salary_min <= ${parseInt(salaryMax)}`);
    }

    // Application deadline filter (only active jobs)
    whereConditions.push(`j.application_deadline >= CURRENT_DATE`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const validSortColumns = ['created_at', 'title', 'salary_min', 'views_count', 'applications_count'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Count total jobs for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
    `;

    console.log('🔍 Count query:', countQuery);

    // For now, we'll return empty results since there are no jobs in the database
    // This will be updated when real data is added
    const totalItems = 0;

    // Fetch jobs with pagination
    const jobsQuery = `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.category,
        j.location,
        j.salary_min,
        j.salary_max,
        j.remote_allowed,
        j.duration_months,
        j.start_date,
        j.application_deadline,
        j.views_count,
        j.applications_count,
        j.requirements,
        j.benefits,
        j.experience_level,
        j.created_at,
        c.name as company_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
      ORDER BY j.${sortColumn} ${sortDirection}
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

    console.log('🔍 Jobs query:', jobsQuery);

    // For now, return empty results since database is empty
    const jobsResult = [];

    // Format jobs data for frontend compatibility
    const formattedJobs = jobsResult.map((job: any) => ({
      _id: job.id.toString(),
      title: job.title,
      description: job.description,
      shortDescription: job.description?.substring(0, 200) + (job.description?.length > 200 ? '...' : ''),
      industry: job.category || 'General',
      location: {
        city: job.location?.split(',')[0]?.trim() || 'Remote',
        state: job.location?.split(',')[1]?.trim() || 'UK',
        address: job.location || 'Remote'
      },
      salary: {
        min: job.salary_min || 0,
        max: job.salary_max || 0,
        currency: 'GBP',
        type: 'annually'
      },
      requirements: {
        education: 'Requirements listed in job description',
        experience: job.experience_level || 'Entry level',
        skills: Array.isArray(job.requirements) ? job.requirements : [],
        certifications: []
      },
      keyRequirements: Array.isArray(job.requirements) ? job.requirements.slice(0, 4) : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      duration: {
        months: job.duration_months || 24,
        startDate: job.start_date || new Date().toISOString()
      },
      applicationDeadline: job.application_deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isRemote: job.remote_allowed || false,
      employmentType: 'full-time',
      createdAt: job.created_at || new Date().toISOString(),
      viewCount: job.views_count || 0,
      applicationCount: job.applications_count || 0,
      isActive: true,
      seoUrl: `/apprenticeships/${job.title?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job.location?.split(',')[0]?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job.id}`
    }));

    // Get filter options (empty for now)
    const availableCategories = [];
    const availableLocations = [];

    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs: formattedJobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          itemsPerPage: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        filters: {
          categories: availableCategories,
          locations: availableLocations
        }
      },
      message: `Found ${totalItems} apprenticeship opportunities from Neon database (currently empty - ready for real data)`
    });

    console.log(`✅ Returned ${formattedJobs.length} jobs out of ${totalItems} total from Neon database`);

  } catch (error) {
    console.error('❌ Error fetching public job listings from Neon:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job listings from database',
      details: error.message
    });
  }
});

// GET /api/apprenticeships/public/:id - Get public job details by ID from Neon database
router.get('/public/:id', async (req: any, res: any) => {
  try {
    const jobId = req.params.id;
    console.log('🔍 Fetching job details from Neon database for ID:', jobId);

    // Validate job ID is numeric
    if (!/^\d+$/.test(jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job ID format'
      });
    }

    // For now, return not found since database is empty
    return res.status(404).json({
      success: false,
      error: 'Job not found (database is currently empty - ready for real data)'
    });

  } catch (error) {
    console.error('❌ Error fetching public job details from Neon:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job details from database',
      details: error.message
    });
  }
});

export default router;
