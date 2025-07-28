import express from "express";
import { body, validationResult } from "express-validator";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
} from "../index";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { sendSuccess, sendError, sendValidationError } from "../utils/apiResponse";
import { validateDatabaseInput } from "../middleware/database";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

// Import production schemas
import { User } from "../models/User";
import { database } from "../config/database";
import EmailService from "../services/emailService";

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["student", "company"])
    .withMessage("Role must be student or company"),
  body("firstName").optional().trim().isLength({ min: 1 }),
  body("lastName").optional().trim().isLength({ min: 1 }),
  body("companyName").optional().trim().isLength({ min: 1 }),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("role").optional().isIn(["student", "company", "admin"]).withMessage("Invalid role"),
];

// User Registration
router.post("/register", registerValidation, asyncHandler(async (req, res) => {
  console.log("Registration attempt started...");
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Registration validation errors:", errors.array());
    return sendValidationError(res, "Validation failed", errors.array());
  }

  const { email, password, role, profile } = req.body;

  // Check database connection
  if (!database.isConnected()) {
    const env = process.env.MONGODB_URI;
    if (!env || env === '') {
      console.warn('⚠️ Using mock registration in development mode');
      const mockUser = {
        _id: 'mock-user-id-' + Date.now(),
        email: email,
        role: role || 'student',
        firstName: req.body.firstName || 'Mock',
        lastName: req.body.lastName || 'User',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date()
      };
      const token = generateToken(mockUser._id, mockUser.role as 'student' | 'company' | 'admin', mockUser.email);
      return sendSuccess(res, {
        token,
        user: mockUser,
        message: 'Mock registration successful (development mode)',
        emailVerificationRequired: false
      }, 201);
    }
    return sendError(res, "Service temporarily unavailable", 503, 'SERVICE_UNAVAILABLE');
  }

  try {
    // Validate input data with DatabaseValidator
    const { validateDatabaseInput } = await import("../middleware/database");
    const validation = validateDatabaseInput('users', { email, password, role, profile });
    if (!validation.isValid && validation.errors) {
      return sendValidationError(res, validation.errors, 'Invalid input data');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "User with this email already exists", 400, 'USER_EXISTS');
    }

    // Create new user with auto-generated email verification token
    const newUser = new User({
      email,
      password, // Will be hashed by pre-save middleware
      role,
      profile,
      isEmailVerified: false,
    });

    // Generate email verification token
    const verificationToken = newUser.generateEmailVerificationToken();
    
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = generateToken(savedUser._id, savedUser.role, savedUser.email);

    console.log(`✅ User registered successfully: ${savedUser.email} (${savedUser.role})`);

    // Send welcome email based on user role
    try {
      if (savedUser.role === 'student') {
        await EmailService.getInstance().sendWelcomeEmailStudent(savedUser);
        console.log(`📧 Welcome email sent to student: ${savedUser.email}`);
      } else if (savedUser.role === 'company') {
        await EmailService.getInstance().sendWelcomeEmailEmployer(savedUser);
        console.log(`📧 Welcome email sent to employer: ${savedUser.email}`);
      }
    } catch (emailError) {
      console.warn('⚠️  Failed to send welcome email:', emailError);
    }

    sendSuccess(res, {
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        profile: savedUser.profile,
        isEmailVerified: savedUser.isEmailVerified,
      },
      emailVerificationRequired: true
    }, 201);

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.name === "ValidationError") {
      return sendValidationError(res, "Validation failed", error.errors);
    }
    if (error.code === 11000) {
      return sendError(res, "User with this email already exists", 400, 'DUPLICATE_EMAIL');
    }
    return sendError(res, "Registration failed", 500, 'REGISTRATION_ERROR');
  }
}));

// User Login
router.post("/login", loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  const { email, password, role } = req.body;

  console.log("Login attempt for:", email, "Role:", role);

  // Check database connection
  if (!database.isConnected()) {
    console.warn("⚠️ Database not connected, login might fail");

    // In development mode without MONGODB_URI, use mock authentication
    const env = process.env.MONGODB_URI;
    if (!env || env === '') {
      console.warn('⚠️ Using mock authentication in development mode');

      // Mock successful login for development
      const mockUser = {
        _id: 'mock-user-id',
        email: email,
        role: role || 'student',
        firstName: 'Mock',
        lastName: 'User',
        isActive: true,
        createdAt: new Date()
      };

      const token = generateToken(mockUser._id, mockUser.role as 'student' | 'company' | 'admin', mockUser.email);

      return sendSuccess(res, {
        token,
        user: mockUser,
        message: 'Mock login successful (development mode)'
      });
    }

    return sendError(res, "Service temporarily unavailable", 503, 'SERVICE_UNAVAILABLE');
  }

  try {
    // Find user by email and optional role
    const query: any = { email, isActive: true };
    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query).select("+password");
    if (!user) {
      return sendError(res, "Invalid credentials", 401, 'INVALID_CREDENTIALS');
    }

    // Verify password using instance method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return sendError(res, "Invalid credentials", 401, 'INVALID_CREDENTIALS');
    }

    // Update last login and activity
    user.lastLoginAt = new Date();
    await user.updateLastActivity();

    // Generate JWT token
    const token = generateToken(user._id, user.role, user.email);

    console.log(`✅ User logged in successfully: ${user.email} (${user.role})`);

    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, "Login failed", 500, 'LOGIN_ERROR');
  }
}));

// Company Registration (Extended)
router.post("/register/company", [
  ...registerValidation,
  body("companyName").notEmpty().withMessage("Company name is required"),
  body("industry").notEmpty().withMessage("Industry is required"),
  body("description").isLength({ min: 50 }).withMessage("Description must be at least 50 characters"),
  body("firstName").notEmpty().withMessage("Contact first name is required"),
  body("lastName").notEmpty().withMessage("Contact last name is required"),
  body("position").notEmpty().withMessage("Contact position is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("postcode").matches(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i).withMessage("Invalid UK postcode"),
  // Legal agreement validations
  body("termsAccepted").custom((value) => {
    if (!value || value !== true) {
      throw new Error("Terms and conditions must be accepted");
    }
    return true;
  }),
  body("privacyAccepted").custom((value) => {
    if (!value || value !== true) {
      throw new Error("Privacy policy must be accepted");
    }
    return true;
  }),
  body("noPoacingAccepted").custom((value) => {
    if (!value || value !== true) {
      throw new Error("No-poaching agreement must be accepted");
    }
    return true;
  }),
  body("exclusivityAccepted").custom((value) => {
    if (!value || value !== true) {
      throw new Error("Exclusivity agreement must be accepted");
    }
    return true;
  }),
  body("dataProcessingAccepted").custom((value) => {
    if (!value || value !== true) {
      throw new Error("Data processing consent must be accepted");
    }
    return true;
  }),
], asyncHandler(async (req, res) => {
  console.log("Company registration attempt started...");
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Company registration validation errors:", errors.array());
    return sendValidationError(res, "Validation failed", errors.array());
  }

  const {
    companyName, industry, companySize, website, description,
    firstName, lastName, position, email,
    address, city, postcode, password,
    termsAccepted, privacyAccepted, noPoacingAccepted,
    exclusivityAccepted, dataProcessingAccepted
  } = req.body;

  // Check database connection
  if (!database.isConnected()) {
    console.warn("⚠️ Database not connected, registration might fail");

    // In development mode without MONGODB_URI, use mock registration
    const env = process.env.MONGODB_URI;
    if (!env || env === '') {
      console.warn('⚠️ Using mock registration in development mode');

      // Mock successful registration for development
      const mockUser = {
        _id: 'mock-user-' + Date.now(),
        email: email,
        role: role || 'student',
        firstName: firstName || 'Mock',
        lastName: lastName || 'User',
        isActive: true,
        createdAt: new Date()
      };

      const token = generateToken(mockUser._id, mockUser.role as 'student' | 'company' | 'admin', mockUser.email);

      return sendSuccess(res, {
        token,
        user: mockUser,
        message: 'Mock registration successful (development mode)'
      });
    }

    return sendError(res, "Service temporarily unavailable", 503, 'SERVICE_UNAVAILABLE');
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "User with this email already exists", 400, 'USER_EXISTS');
    }

    // Create company profile
    const companyProfile = {
      companyName,
      industry,
      companySize: companySize || '1-10',
      website,
      description,
      location: {
        address,
        city,
        postcode: postcode.toUpperCase(),
        country: 'United Kingdom',
        coordinates: [0, 0] // Would geocode in production
      },
      contactPerson: {
        firstName,
        lastName,
        position,
        email
      },
      verificationStatus: 'pending',
      complianceChecks: {
        hasPublicLiabilityInsurance: false,
        hasEmployersLiabilityInsurance: false,
        isRegisteredForApprenticeships: false
      }
    };

    // Create user with company profile
    const user = new User({
      email,
      password, // Will be hashed by pre-save middleware
      role: "company",
      profile: companyProfile,
      isEmailVerified: false
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();

    const savedUser = await user.save();

    // Create trial subscription if subscription service is available
    try {
      const { SubscriptionService } = await import('../services/subscriptionService');
      await SubscriptionService.createTrialSubscription(savedUser._id.toString());
      console.log(`✅ Trial subscription created for company: ${companyName}`);
    } catch (error) {
      console.log('Trial subscription creation failed (non-critical):', error);
    }

    // Generate JWT token
    const token = generateToken(savedUser._id, savedUser.role, savedUser.email);

    console.log(`✅ Company registered successfully: ${companyName} (${savedUser.email})`);

    sendSuccess(res, {
      message: "Company account created successfully",
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        companyName: savedUser.profile?.companyName,
        isEmailVerified: savedUser.isEmailVerified
      },
      emailVerificationRequired: true
    }, 201);

  } catch (error: any) {
    console.error('Company registration error:', error);
    
    if (error.name === "ValidationError") {
      return sendValidationError(res, "Validation failed", error.errors);
    }
    if (error.code === 11000) {
      return sendError(res, "User with this email already exists", 400, 'DUPLICATE_EMAIL');
    }
    return sendError(res, "Company registration failed", 500, 'REGISTRATION_ERROR');
  }
}));

// Email Verification
router.post("/verify-email", asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return sendError(res, "Verification token is required", 400, 'TOKEN_REQUIRED');
  }

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return sendError(res, "Invalid or expired verification token", 400, 'INVALID_TOKEN');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`✅ Email verified for user: ${user.email}`);

    sendSuccess(res, {
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error: any) {
    console.error('Email verification error:', error);
    return sendError(res, "Email verification failed", 500, 'VERIFICATION_ERROR');
  }
}));

// Password Reset Request
router.post("/forgot-password", [
  body("email").isEmail().normalizeEmail()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email, isActive: true });
    
    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return sendSuccess(res, {
        message: "If an account with that email exists, we've sent a password reset link"
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send password reset email
    console.log(`Password reset token generated for ${email}: ${resetToken}`);

    sendSuccess(res, {
      message: "If an account with that email exists, we've sent a password reset link"
    });

  } catch (error: any) {
    console.error('Password reset request error:', error);
    return sendError(res, "Password reset request failed", 500, 'RESET_REQUEST_ERROR');
  }
}));

// Password Reset
router.post("/reset-password", [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number")
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return sendError(res, "Invalid or expired reset token", 400, 'INVALID_TOKEN');
    }

    user.password = password; // Will be hashed by pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    sendSuccess(res, {
      message: "Password reset successfully"
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    return sendError(res, "Password reset failed", 500, 'RESET_ERROR');
  }
}));

// Get Current User Profile
router.get("/me", authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      return sendError(res, "User not found", 404, 'USER_NOT_FOUND');
    }

    // Update last activity
    await user.updateLastActivity();

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        lastActivityAt: user.lastActivityAt,
        createdAt: user.createdAt
      }
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return sendError(res, "Failed to get user profile", 500, 'PROFILE_ERROR');
  }
}));

// Update User Profile
router.put("/me", authenticateToken, validateDatabaseInput('users'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const validation = validateUserUpdate(req.body);
    if (!validation.success) {
      return sendValidationError(res, 'Invalid input data', validation.error?.errors);
    }

    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      return sendError(res, "User not found", 404, 'USER_NOT_FOUND');
    }

    // Update allowed fields
    const { profile, settings } = req.body;
    
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    await user.save();

    console.log(`✅ Profile updated for user: ${user.email}`);

    sendSuccess(res, {
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.name === "ValidationError") {
      return sendValidationError(res, "Validation failed", error.errors);
    }
    return sendError(res, "Failed to update profile", 500, 'UPDATE_ERROR');
  }
}));

// Logout (token invalidation would be handled client-side or with a token blacklist)
router.post("/logout", authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // In a production system, you might want to blacklist the token
  // For now, just return success
  console.log(`User logged out: ${req.user?.email}`);
  
  sendSuccess(res, {
    message: "Logged out successfully"
  });
}));

// Deactivate Account
router.delete("/me", authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      return sendError(res, "User not found", 404, 'USER_NOT_FOUND');
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason || 'User requested account deactivation';
    await user.save();

    console.log(`✅ Account deactivated for user: ${user.email}`);

    sendSuccess(res, {
      message: "Account deactivated successfully"
    });

  } catch (error: any) {
    console.error('Account deactivation error:', error);
    return sendError(res, "Failed to deactivate account", 500, 'DEACTIVATION_ERROR');
  }
}));

export default router;
