import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req: any, res: any) => {
  console.log('📝 Registration attempt started...');

  try {
    const { email, password, role, profile } = req.body;

    console.log('📝 Registration data received:', { email, role, hasProfile: !!profile });

    // Basic validation
    if (!email || !password || !role || !profile) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Email, password, role, and profile are required'
      });
    }

    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email: email.toLowerCase() }).catch(err => {
      console.log('⚠️ Database query error (continuing anyway):', err.message);
      return null;
    });

    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create basic user data
    console.log('👤 Creating new user...');
    const userData = {
      email: email.toLowerCase(),
      password, // Will be hashed by model middleware
      role,
      profile: role === 'student' ? {
        firstName: profile.firstName || 'Student',
        lastName: profile.lastName || 'User',
        skills: profile.skills || [],
        hasDriversLicense: false,
        education: [],
        experience: [],
        location: profile.location || { city: 'Unknown', postcode: '', coordinates: [0, 0] },
        preferences: {
          industries: [],
          maxDistance: 25,
          salaryRange: { min: 0, max: 100000 },
          workType: 'both',
          remoteWork: false
        },
        transportModes: [],
        isActive: true,
        profileCompletion: 20,
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          applicationUpdates: true,
          jobRecommendations: true
        }
      } : {
        companyName: profile.companyName || 'Company',
        industry: profile.industry || 'Technology',
        description: profile.description || 'A great company',
        companySize: '1-10',
        location: profile.location || { city: 'Unknown', address: 'Unknown', coordinates: [0, 0] },
        contactPerson: {
          firstName: profile.contactPerson?.firstName || 'Contact',
          lastName: profile.contactPerson?.lastName || 'Person',
          position: profile.contactPerson?.position || 'Manager'
        },
        benefits: [],
        culture: [],
        isVerified: false,
        subscriptionPlan: 'free',
        jobPostingLimit: 3,
        jobPostingsUsed: 0,
        notificationSettings: {
          applicationAlerts: true,
          weeklyReports: true,
          marketingEmails: false
        }
      },
      isEmailVerified: false,
      isActive: true
    };

    console.log('💾 Saving user to database...');
    const newUser = new User(userData);
    await newUser.save().catch(err => {
      console.error('❌ Database save error:', err);
      throw new Error(`Database save failed: ${err.message}`);
    });

    console.log('✅ User created successfully');

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'development-secret-key-minimum-32-characters-long-for-security';
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role, email: newUser.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('🔑 JWT token generated');

    // Return success response
    const response = {
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
      message: 'User registered successfully'
    };

    console.log('✅ Registration completed successfully');
    return res.status(201).json(response);

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Stack trace:', error.stack);

    // Ensure we don't send response twice
    if (res.headersSent) {
      console.log('⚠️ Headers already sent, cannot send error response');
      return;
    }

    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: any, res: any) => {
  console.log('🔐 Login attempt started...');

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    console.log('🔍 Finding user...');
    const user = await User.findOne({ email: email.toLowerCase() }).catch(err => {
      console.log('⚠️ Database query error:', err.message);
      return null;
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log('🔑 Checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save().catch(err => {
      console.log('⚠️ Could not update last login:', err.message);
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'development-secret-key-minimum-32-characters-long-for-security';
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful');

    return res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login error:', error);

    if (res.headersSent) {
      return;
    }

    return res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
});

// GET /api/auth/verify-token - Verify if token is valid
router.get('/verify-token', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'development-secret-key-minimum-32-characters-long-for-security';
    const decoded = jwt.verify(token, jwtSecret) as any;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isEmailVerified: user.isEmailVerified
        },
        tokenValid: true
      }
    });
  } catch (error) {
    console.error('❌ Token verification error:', error);

    if (res.headersSent) {
      return;
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      tokenValid: false
    });
  }
});

export default router;