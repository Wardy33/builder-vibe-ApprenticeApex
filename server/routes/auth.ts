import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

// POST /api/auth/register - Register new user (EXISTING - KEEP THIS)
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration request received');
    const { email, password, role, profile } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, password, and role are required' 
      });
    }
    
    const userData = {
      email: email.toLowerCase(),
      password,
      role,
      profile: profile || (role === 'student' ? {
        firstName: 'New',
        lastName: 'User',
        skills: [],
        hasDriversLicense: false,
        education: [],
        experience: [],
        location: { city: 'Unknown', postcode: '', coordinates: [0, 0] },
        preferences: {
          industries: [],
          maxDistance: 25,
          salaryRange: { min: 0, max: 100000 }
        },
        transportModes: [],
        isActive: true
      } : {
        companyName: profile?.companyName || 'New Company',
        industry: profile?.industry || 'Technology',
        description: profile?.description || 'A company',
        location: { city: 'Unknown', address: 'Unknown', coordinates: [0, 0] },
        contactPerson: {
          firstName: 'Contact',
          lastName: 'Person',
          position: 'Manager'
        },
        isVerified: false
      }),
      isEmailVerified: false,
      isActive: true
    };
    
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'User already exists' 
        });
      }
      
      const newUser = new User(userData);
      await newUser.save();
      
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role, email: newUser.email },
        process.env.JWT_SECRET || 'dev-secret-key-minimum-32-characters-long',
        { expiresIn: '7d' }
      );
      
      console.log('✅ Registration successful for:', email);
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            profile: newUser.profile,
            isEmailVerified: newUser.isEmailVerified,
            createdAt: newUser.createdAt
          },
          token
        },
        message: 'Registration successful'
      });
      
    } catch (dbError) {
      console.log('Database error, using mock response:', dbError.message);
      
      const mockToken = jwt.sign(
        { userId: 'mock-' + Date.now(), role, email: userData.email },
        process.env.JWT_SECRET || 'dev-secret-key-minimum-32-characters-long',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: 'mock-' + Date.now(),
            email: userData.email,
            role,
            profile: userData.profile,
            isEmailVerified: false,
            createdAt: new Date()
          },
          token: mockToken
        },
        message: 'Registration successful (development mode)'
      });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Registration failed',
        details: error.message 
      });
    }
  }
});

// POST /api/auth/login - LOGIN ENDPOINT (THIS IS MISSING - ADD THIS)
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request received');
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }
    
    console.log('🔍 Looking for user:', email);
    
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }
      
      console.log('👤 User found, checking password...');
      
      // Check if user is active
      if (!user.isActive) {
        console.log('❌ User account is deactivated');
        return res.status(401).json({ 
          success: false, 
          error: 'Account has been deactivated' 
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', email);
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }
      
      console.log('✅ Password verified, generating token...');
      
      // Update last login
      try {
        user.lastLogin = new Date();
        await user.save();
      } catch (updateError) {
        console.warn('⚠️ Could not update last login:', updateError.message);
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'dev-secret-key-minimum-32-characters-long',
        { expiresIn: '7d' }
      );
      
      console.log('✅ Login successful for:', email);
      
      // Return user data without sensitive information
      const userResponse = {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };
      
      res.json({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'Login successful'
      });
      
    } catch (dbError) {
      console.error('❌ Database error during login:', dbError.message);
      
      // For development: provide mock login if database fails
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Using mock login for development');
        
        const mockToken = jwt.sign(
          { userId: 'mock-user-id', role: 'student', email: email.toLowerCase() },
          process.env.JWT_SECRET || 'dev-secret-key-minimum-32-characters-long',
          { expiresIn: '7d' }
        );
        
        return res.json({
          success: true,
          data: {
            user: {
              _id: 'mock-user-id',
              email: email.toLowerCase(),
              role: 'student',
              profile: {
                firstName: 'Mock',
                lastName: 'User'
              },
              isEmailVerified: false,
              lastLogin: new Date(),
              createdAt: new Date()
            },
            token: mockToken
          },
          message: 'Login successful (development mode)'
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection error',
        details: 'Unable to verify credentials'
      });
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Login failed',
        details: error.message 
      });
    }
  }
});

// GET /api/auth/test - Test endpoint (EXISTING - KEEP THIS)
router.get('/test', (req, res) => {
  console.log('🧪 Auth test endpoint hit');
  res.json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',  // ← This should now be available
      'GET /api/auth/test'
    ]
  });
});

console.log('🔧 Auth routes module loaded successfully');
console.log('📋 Available endpoints: register, login, test');

export default router;
