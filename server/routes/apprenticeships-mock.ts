import express from 'express';

const router = express.Router();

// Mock apprenticeship data for development
const mockApprenticeships = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Software Developer Apprenticeship',
    description: 'Join our dynamic software development team and learn cutting-edge technologies while building real-world applications. You\'ll work alongside experienced developers on projects that impact millions of users worldwide. This comprehensive program covers full-stack development, DevOps practices, and modern software engineering principles. Perfect for ambitious individuals looking to start their tech career.',
    shortDescription: 'Join our dynamic software development team and learn cutting-edge technologies while building real-world applications...',
    industry: 'Technology',
    location: {
      city: 'London',
      state: 'England',
      address: '123 Tech Street, London'
    },
    salary: {
      min: 18000,
      max: 25000,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'A-levels or equivalent',
      experience: 'No prior experience required',
      skills: ['JavaScript', 'HTML', 'CSS', 'Problem Solving', 'Communication'],
      certifications: []
    },
    keyRequirements: ['JavaScript', 'HTML', 'CSS', 'Problem Solving'],
    benefits: ['Health Insurance', 'Training Budget', 'Flexible Hours', 'Career Progression'],
    duration: {
      months: 24,
      startDate: '2024-09-01T00:00:00.000Z'
    },
    applicationDeadline: '2025-02-28T23:59:59.000Z',
    isRemote: false,
    employmentType: 'full-time',
    createdAt: '2024-08-01T10:00:00.000Z',
    viewCount: 156,
    applicationCount: 23,
    isActive: true,
    seoUrl: '/apprenticeships/software-developer-apprenticeship-london-507f1f77bcf86cd799439011'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Digital Marketing Apprentice',
    description: 'Launch your marketing career with this exciting apprenticeship program. Learn SEO, social media marketing, content creation, and digital analytics while working on real campaigns for major brands. You\'ll gain hands-on experience with industry-standard tools and work directly with our award-winning marketing team. This role offers excellent progression opportunities into senior marketing positions.',
    shortDescription: 'Launch your marketing career with this exciting apprenticeship program. Learn SEO, social media marketing, content creation...',
    industry: 'Technology',
    location: {
      city: 'Manchester',
      state: 'England',
      address: '456 Marketing Ave, Manchester'
    },
    salary: {
      min: 16000,
      max: 22000,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'GCSEs including English and Maths',
      experience: 'Social media savvy preferred',
      skills: ['Social Media', 'Content Writing', 'Analytics', 'Creativity', 'Communication'],
      certifications: []
    },
    keyRequirements: ['Social Media', 'Content Writing', 'Analytics', 'Creativity'],
    benefits: ['Professional Development', 'Team Events', 'Hybrid Working', 'Mentorship'],
    duration: {
      months: 18,
      startDate: '2024-10-01T00:00:00.000Z'
    },
    applicationDeadline: '2025-03-31T23:59:59.000Z',
    isRemote: true,
    employmentType: 'full-time',
    createdAt: '2024-08-05T14:30:00.000Z',
    viewCount: 234,
    applicationCount: 45,
    isActive: true,
    seoUrl: '/apprenticeships/digital-marketing-apprentice-manchester-507f1f77bcf86cd799439012'
  },
  {
    _id: '507f1f77bcf86cd799439013',
    title: 'Data Analyst Apprenticeship',
    description: 'Dive into the world of data science and analytics with this comprehensive apprenticeship. Learn Python, SQL, data visualization tools like Tableau, and statistical analysis methods. Work on real business problems and help drive data-driven decision making across our organization. You\'ll be mentored by senior data scientists and gain experience with machine learning fundamentals.',
    shortDescription: 'Dive into the world of data science and analytics with this comprehensive apprenticeship. Learn Python, SQL, data visualization...',
    industry: 'Technology',
    location: {
      city: 'Birmingham',
      state: 'England',
      address: '789 Data Drive, Birmingham'
    },
    salary: {
      min: 19000,
      max: 26000,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'A-levels including Maths',
      experience: 'Basic Excel skills preferred',
      skills: ['Mathematics', 'Excel', 'Problem Solving', 'Attention to Detail', 'Python'],
      certifications: []
    },
    keyRequirements: ['Mathematics', 'Excel', 'Problem Solving', 'Python'],
    benefits: ['Learning Budget', 'Conference Attendance', 'Certification Support', 'Flexible Hours'],
    duration: {
      months: 30,
      startDate: '2024-09-15T00:00:00.000Z'
    },
    applicationDeadline: '2025-04-30T23:59:59.000Z',
    isRemote: false,
    employmentType: 'full-time',
    createdAt: '2024-08-10T09:15:00.000Z',
    viewCount: 189,
    applicationCount: 34,
    isActive: true,
    seoUrl: '/apprenticeships/data-analyst-apprenticeship-birmingham-507f1f77bcf86cd799439013'
  },
  {
    _id: '507f1f77bcf86cd799439014',
    title: 'Cyber Security Apprentice',
    description: 'Start your career in cybersecurity with this intensive apprenticeship program. Learn about network security, ethical hacking, incident response, and compliance frameworks. Work with cutting-edge security tools and gain hands-on experience protecting critical infrastructure. This program includes industry certifications and direct mentorship from cybersecurity experts.',
    shortDescription: 'Start your career in cybersecurity with this intensive apprenticeship program. Learn about network security, ethical hacking...',
    industry: 'Technology',
    location: {
      city: 'Bristol',
      state: 'England',
      address: '321 Security Blvd, Bristol'
    },
    salary: {
      min: 20000,
      max: 28000,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'A-levels or equivalent',
      experience: 'Interest in technology and security',
      skills: ['Networking', 'Problem Solving', 'Attention to Detail', 'Research Skills', 'Communication'],
      certifications: []
    },
    keyRequirements: ['Networking', 'Problem Solving', 'Attention to Detail', 'Research Skills'],
    benefits: ['Certification Funding', 'Security Clearance', 'Career Progression', 'Training Courses'],
    duration: {
      months: 36,
      startDate: '2024-09-30T00:00:00.000Z'
    },
    applicationDeadline: '2025-03-15T23:59:59.000Z',
    isRemote: false,
    employmentType: 'full-time',
    createdAt: '2024-08-12T16:45:00.000Z',
    viewCount: 298,
    applicationCount: 67,
    isActive: true,
    seoUrl: '/apprenticeships/cyber-security-apprentice-bristol-507f1f77bcf86cd799439014'
  },
  {
    _id: '507f1f77bcf86cd799439015',
    title: 'Mechanical Engineering Apprentice',
    description: 'Join our world-class engineering team and learn hands-on mechanical engineering skills. Work on innovative projects ranging from automotive components to renewable energy systems. You\'ll gain experience with CAD software, manufacturing processes, and quality assurance while earning a recognized engineering qualification. Excellent progression opportunities into senior engineering roles.',
    shortDescription: 'Join our world-class engineering team and learn hands-on mechanical engineering skills. Work on innovative projects...',
    industry: 'Engineering',
    location: {
      city: 'Sheffield',
      state: 'England',
      address: '654 Engineering Way, Sheffield'
    },
    salary: {
      min: 17000,
      max: 24000,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'A-levels including Maths and Physics',
      experience: 'No prior experience required',
      skills: ['Mathematics', 'Physics', 'CAD Software', 'Problem Solving', 'Teamwork'],
      certifications: []
    },
    keyRequirements: ['Mathematics', 'Physics', 'CAD Software', 'Problem Solving'],
    benefits: ['Tool Allowance', 'Professional Membership', 'Study Time', 'Career Development'],
    duration: {
      months: 48,
      startDate: '2024-09-01T00:00:00.000Z'
    },
    applicationDeadline: '2025-02-28T23:59:59.000Z',
    isRemote: false,
    employmentType: 'full-time',
    createdAt: '2024-08-08T11:20:00.000Z',
    viewCount: 145,
    applicationCount: 28,
    isActive: true,
    seoUrl: '/apprenticeships/mechanical-engineering-apprentice-sheffield-507f1f77bcf86cd799439015'
  },
  {
    _id: '507f1f77bcf86cd799439016',
    title: 'Business Administration Apprentice',
    description: 'Develop essential business skills in this comprehensive administration apprenticeship. Learn project management, business communication, data analysis, and office management while working across different departments. This role offers excellent exposure to various business functions and provides a strong foundation for future management positions.',
    shortDescription: 'Develop essential business skills in this comprehensive administration apprenticeship. Learn project management, business communication...',
    industry: 'Finance',
    location: {
      city: 'Leeds',
      state: 'England',
      address: '987 Business Park, Leeds'
    },
    salary: {
      min: 15000,
      max: 21000,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'GCSEs including English and Maths',
      experience: 'Customer service experience preferred',
      skills: ['Communication', 'Organization', 'Microsoft Office', 'Customer Service', 'Attention to Detail'],
      certifications: []
    },
    keyRequirements: ['Communication', 'Organization', 'Microsoft Office', 'Customer Service'],
    benefits: ['Study Support', 'Career Progression', 'Pension Scheme', 'Professional Development'],
    duration: {
      months: 18,
      startDate: '2024-10-15T00:00:00.000Z'
    },
    applicationDeadline: '2025-04-15T23:59:59.000Z',
    isRemote: false,
    employmentType: 'full-time',
    createdAt: '2024-08-15T13:10:00.000Z',
    viewCount: 167,
    applicationCount: 41,
    isActive: true,
    seoUrl: '/apprenticeships/business-administration-apprentice-leeds-507f1f77bcf86cd799439016'
  },
  {
    _id: '507f1f77bcf86cd799439017',
    title: 'Healthcare Support Worker Apprentice',
    description: 'Begin your healthcare career with this rewarding apprenticeship program. Work directly with patients while learning essential healthcare skills, medical procedures, and patient care techniques. You\'ll be supported by experienced healthcare professionals and gain a nationally recognized qualification in health and social care.',
    shortDescription: 'Begin your healthcare career with this rewarding apprenticeship program. Work directly with patients while learning essential...',
    industry: 'Healthcare',
    location: {
      city: 'Liverpool',
      state: 'England',
      address: '246 Healthcare Road, Liverpool'
    },
    salary: {
      min: 16500,
      max: 22500,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'GCSEs including English and Maths',
      experience: 'Caring nature and people skills',
      skills: ['Empathy', 'Communication', 'Teamwork', 'Attention to Detail', 'Physical Fitness'],
      certifications: []
    },
    keyRequirements: ['Empathy', 'Communication', 'Teamwork', 'Attention to Detail'],
    benefits: ['NHS Pension', 'Professional Development', 'Career Progression', 'Training Support'],
    duration: {
      months: 24,
      startDate: '2024-09-01T00:00:00.000Z'
    },
    applicationDeadline: '2025-03-31T23:59:59.000Z',
    isRemote: false,
    employmentType: 'full-time',
    createdAt: '2024-08-18T08:30:00.000Z',
    viewCount: 278,
    applicationCount: 89,
    isActive: true,
    seoUrl: '/apprenticeships/healthcare-support-worker-apprentice-liverpool-507f1f77bcf86cd799439017'
  },
  {
    _id: '507f1f77bcf86cd799439018',
    title: 'Construction Project Manager Apprentice',
    description: 'Learn construction project management with this hands-on apprenticeship program. Gain experience in planning, scheduling, budget management, and health & safety compliance while working on real construction projects. This program combines classroom learning with practical site experience and leads to professional project management qualifications.',
    shortDescription: 'Learn construction project management with this hands-on apprenticeship program. Gain experience in planning, scheduling...',
    industry: 'Construction',
    location: {
      city: 'Newcastle',
      state: 'England',
      address: '135 Construction Ave, Newcastle'
    },
    salary: {
      min: 18500,
      max: 25500,
      currency: 'GBP',
      type: 'annually'
    },
    requirements: {
      education: 'A-levels or equivalent',
      experience: 'Interest in construction industry',
      skills: ['Leadership', 'Organization', 'Problem Solving', 'Communication', 'Mathematics'],
      certifications: []
    },
    keyRequirements: ['Leadership', 'Organization', 'Problem Solving', 'Communication'],
    benefits: ['CSCS Card', 'Professional Qualifications', 'Company Vehicle', 'Career Progression'],
    duration: {
      months: 36,
      startDate: '2024-10-01T00:00:00.000Z'
    },
    applicationDeadline: '2025-03-20T23:59:59.000Z',
    isRemote: false,
    employmentType: 'full-time',
    createdAt: '2024-08-20T15:45:00.000Z',
    viewCount: 198,
    applicationCount: 52,
    isActive: true,
    seoUrl: '/apprenticeships/construction-project-manager-apprentice-newcastle-507f1f77bcf86cd799439018'
  }
];

// Helper function to filter and search mock data
function filterMockData(apprenticeships: any[], filters: any) {
  return apprenticeships.filter(job => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.requirements.skills.some((skill: string) => skill.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (job.industry !== filters.category) return false;
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      if (!job.location.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
    }

    // Salary filters
    if (filters.salaryMin && job.salary.max < parseInt(filters.salaryMin)) return false;
    if (filters.salaryMax && job.salary.min > parseInt(filters.salaryMax)) return false;

    return true;
  });
}

// GET /api/apprenticeships/public - Get public job listings for SEO (no auth required)
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
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('🔍 Fetching public apprenticeships with filters:', { page, limit, search, category, location });

    const filters = { search, category, location, salaryMin, salaryMax };
    let filteredJobs = filterMockData(mockApprenticeships, filters);

    // Sort jobs
    filteredJobs.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return new Date(bValue).getTime() - new Date(aValue).getTime();
      } else {
        return new Date(aValue).getTime() - new Date(bValue).getTime();
      }
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedJobs = filteredJobs.slice(skip, skip + parseInt(limit));

    // Add SEO URLs and format data
    const jobsWithUrls = paginatedJobs.map(job => ({
      ...job,
      seoUrl: `/apprenticeships/${job.title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job.location.city?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job._id}`,
      shortDescription: job.description?.substring(0, 200) + (job.description?.length > 200 ? '...' : ''),
      keyRequirements: job.requirements?.skills?.slice(0, 4) || []
    }));

    // Get filter options
    const availableCategories = [...new Set(mockApprenticeships.map(job => job.industry))].sort();
    const availableLocations = [...new Set(mockApprenticeships.map(job => job.location.city))].sort();

    res.json({
      success: true,
      data: {
        jobs: jobsWithUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredJobs.length / parseInt(limit)),
          totalItems: filteredJobs.length,
          itemsPerPage: parseInt(limit),
          hasNext: skip + paginatedJobs.length < filteredJobs.length,
          hasPrev: parseInt(page) > 1
        },
        filters: {
          categories: availableCategories,
          locations: availableLocations
        }
      },
      message: `Found ${filteredJobs.length} apprenticeship opportunities`
    });

    console.log(`✅ Returned ${paginatedJobs.length} jobs out of ${filteredJobs.length} total`);

  } catch (error) {
    console.error('❌ Error fetching public job listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job listings',
      details: error.message
    });
  }
});

// GET /api/apprenticeships/public/:id - Get public job details by ID
router.get('/public/:id', async (req: any, res: any) => {
  try {
    const jobId = req.params.id;
    console.log('🔍 Fetching job details for ID:', jobId);

    const job = mockApprenticeships.find(j => j._id === jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if job is still active and accepting applications
    if (!job.isActive || new Date(job.applicationDeadline) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'This job listing is no longer accepting applications'
      });
    }

    // Increment view count (in real app, this would update the database)
    job.viewCount += 1;

    // Generate enhanced job data
    const jobWithMeta = {
      ...job,
      seoUrl: `/apprenticeships/${job.title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job.location.city?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')}-${job._id}`,
      formattedSalary: `£${job.salary.min?.toLocaleString()} - £${job.salary.max?.toLocaleString()} ${job.salary.type}`,
      daysUntilDeadline: Math.ceil((new Date(job.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: jobWithMeta
    });

    console.log(`✅ Returned job details for: ${job.title}`);

  } catch (error) {
    console.error('❌ Error fetching public job details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job details',
      details: error.message
    });
  }
});

export default router;
