import express from 'express';

const router = express.Router();

// Neon database helper imports
import { mcp__neon__run_sql } from '../config/neon';

const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || 'winter-bread-79671472';

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
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      whereConditions.push(`(
        j.title ILIKE $${paramIndex} OR 
        j.description ILIKE $${paramIndex} OR 
        j.requirements::text ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category && category !== 'all') {
      whereConditions.push(`j.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    // Location filter
    if (location && location !== 'all') {
      whereConditions.push(`j.location ILIKE $${paramIndex}`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    // Salary filters
    if (salaryMin) {
      whereConditions.push(`j.salary_max >= $${paramIndex}`);
      queryParams.push(parseInt(salaryMin));
      paramIndex++;
    }
    if (salaryMax) {
      whereConditions.push(`j.salary_min <= $${paramIndex}`);
      queryParams.push(parseInt(salaryMax));
      paramIndex++;
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
    console.log('🔍 Query params:', queryParams);

    const countResult = await mcp__neon__run_sql({
      sql: countQuery,
      projectId: NEON_PROJECT_ID,
      params: queryParams
    });

    const totalItems = parseInt(countResult[0]?.total || '0');

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
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit), offset);

    console.log('🔍 Jobs query:', jobsQuery);

    const jobsResult = await mcp__neon__run_sql({
      sql: jobsQuery,
      projectId: NEON_PROJECT_ID,
      params: queryParams
    });

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

    // Get filter options from database
    const categoriesQuery = `
      SELECT DISTINCT category 
      FROM jobs 
      WHERE status = 'active' AND category IS NOT NULL 
      ORDER BY category
    `;
    const categoriesResult = await mcp__neon__run_sql({
      sql: categoriesQuery,
      projectId: NEON_PROJECT_ID
    });

    const locationsQuery = `
      SELECT DISTINCT location 
      FROM jobs 
      WHERE status = 'active' AND location IS NOT NULL 
      ORDER BY location
    `;
    const locationsResult = await mcp__neon__run_sql({
      sql: locationsQuery,
      projectId: NEON_PROJECT_ID
    });

    const availableCategories = categoriesResult.map((row: any) => row.category).filter(Boolean);
    const availableLocations = locationsResult.map((row: any) => row.location.split(',')[0].trim()).filter(Boolean);

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
          categories: [...new Set(availableCategories)].sort(),
          locations: [...new Set(availableLocations)].sort()
        }
      },
      message: `Found ${totalItems} apprenticeship opportunities from Neon database`
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

    const jobQuery = `
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
        j.status,
        c.name as company_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `;

    const jobResult = await mcp__neon__run_sql({
      sql: jobQuery,
      projectId: NEON_PROJECT_ID,
      params: [parseInt(jobId)]
    });

    if (!jobResult || jobResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const job = jobResult[0];

    // Check if job is still active and accepting applications
    if (job.status !== 'active') {
      return res.status(410).json({
        success: false,
        error: 'This job listing is no longer accepting applications'
      });
    }

    const applicationDeadline = new Date(job.application_deadline);
    const currentDate = new Date();
    if (applicationDeadline < currentDate) {
      return res.status(410).json({
        success: false,
        error: 'This job listing is no longer accepting applications'
      });
    }

    // Increment view count
    const updateViewsQuery = `
      UPDATE jobs 
      SET views_count = views_count + 1 
      WHERE id = $1
    `;
    await mcp__neon__run_sql({
      sql: updateViewsQuery,
      projectId: NEON_PROJECT_ID,
      params: [parseInt(jobId)]
    });

    // Format job data for frontend compatibility
    const formattedJob = {
      _id: job.id.toString(),
      title: job.title,
      description: job.description,
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
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      duration: {
        months: job.duration_months || 24,
        startDate: job.start_date || new Date().toISOString()
      },
      applicationDeadline: job.application_deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isRemote: job.remote_allowed || false,
      employmentType: 'full-time',
      createdAt: job.created_at || new Date().toISOString(),
      viewCount: (job.views_count || 0) + 1, // Include the increment
      applicationCount: job.applications_count || 0,
      seoUrl: `/apprenticeships/${job.title?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job.location?.split(',')[0]?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job.id}`,
      formattedSalary: `£${(job.salary_min || 0).toLocaleString()} - £${(job.salary_max || 0).toLocaleString()} annually`,
      daysUntilDeadline: Math.ceil((applicationDeadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: formattedJob
    });

    console.log(`✅ Returned job details from Neon database for: ${job.title}`);

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
