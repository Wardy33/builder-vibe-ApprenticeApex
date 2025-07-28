import express from 'express';

const router = express.Router();

// POST /api/auth/register - Register new user (isolated version)
router.post('/register', async (req, res) => {
  console.log('📝 Registration request received (isolated)');
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { email, password, role, profile } = req.body;

    // Basic validation
    if (!email || !password || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Email, password, and role are required'
      });
    }

    console.log('✅ Validation passed');
    console.log('📧 Email:', email);
    console.log('👤 Role:', role);
    console.log('📝 Has profile:', !!profile);

    // For now, just return a mock successful response
    // This tests if the route works without database dependencies
    const mockUser = {
      _id: 'mock-' + Date.now(),
      email: email.toLowerCase(),
      role,
      profile: profile || {
        firstName: 'Test',
        lastName: 'User'
      },
      isEmailVerified: false,
      createdAt: new Date()
    };

    const mockToken = 'mock-token-' + Date.now();

    console.log('✅ Sending mock success response');

    res.status(201).json({
      success: true,
      data: {
        user: mockUser,
        token: mockToken
      },
      message: 'User registered successfully (mock mode)'
    });

    console.log('✅ Response sent successfully');

  } catch (error) {
    console.error('❌ Error in registration:', error);
    console.error('❌ Error stack:', error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        details: error.message
      });
    }
  }
});

// POST /api/auth/login - Login user (isolated version)
router.post('/login', async (req, res) => {
  console.log('🔐 Login request received (isolated)');

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Mock successful login for testing
    const mockUser = {
      _id: 'mock-user-' + Date.now(),
      email: email.toLowerCase(),
      role: 'student',
      profile: {
        firstName: 'Test',
        lastName: 'User'
      },
      isEmailVerified: false
    };

    const mockToken = 'mock-token-' + Date.now();

    res.json({
      success: true,
      data: {
        user: mockUser,
        token: mockToken
      },
      message: 'Login successful (mock mode)'
    });

  } catch (error) {
    console.error('❌ Login error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }
});

// GET /api/auth/test - Simple test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 Auth test endpoint hit');
  res.json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

console.log('🔧 Auth routes module loaded successfully');

export default router;