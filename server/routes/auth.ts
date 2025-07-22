import express from "express";
import { body, validationResult } from "express-validator";
import {
  hashPassword,
  comparePassword,
  generateToken,
  mockStudents,
  mockCompanies,
} from "../index";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { User } from "../models/User";
import { Subscription } from "../models/Payment";

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
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
];

// Register endpoint
router.post(
  "/register",
  registerValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { email, password, role, firstName, lastName, companyName } =
      req.body;

    // Check if user already exists (mock check)
    const existingUser = [...mockStudents, ...mockCompanies].find(
      (user) => user.email === email,
    );

    if (existingUser) {
      throw new CustomError("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user profile based on role
    let profile: any = {};
    if (role === "student") {
      if (!firstName || !lastName) {
        throw new CustomError(
          "First name and last name required for students",
          400,
        );
      }
      profile = {
        firstName,
        lastName,
        bio: "",
        skills: [],
        education: [],
        experience: [],
        location: { city: "", coordinates: [0, 0] },
        preferences: {
          industries: [],
          maxDistance: 25,
          salaryRange: { min: 0, max: 100000 },
        },
        isActive: true,
      };
    } else if (role === "company") {
      if (!companyName) {
        throw new CustomError(
          "Company name required for company accounts",
          400,
        );
      }
      profile = {
        companyName,
        industry: "",
        description: "",
        location: { city: "", address: "", coordinates: [0, 0] },
        contactPerson: {
          firstName: firstName || "",
          lastName: lastName || "",
          position: "",
        },
        isVerified: false,
      };
    }

    // In a real app, save to database
    const userId = `${role}_${Date.now()}`;
    const token = generateToken(userId, role);

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: userId,
        email,
        role,
        profile,
        isEmailVerified: false,
      },
      token,
    });
  }),
);

// Login endpoint
router.post(
  "/login",
  loginValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { email, password } = req.body;

    // Find user (mock lookup)
    const user = [...mockStudents, ...mockCompanies].find(
      (user) => user.email === email,
    );

    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    // In a real app, compare with hashed password
    // const isValidPassword = await comparePassword(password, user.password);
    // For mock, we'll assume password is correct if user exists

    const token = generateToken(user._id, user.role);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    });
  }),
);

// Refresh token endpoint
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError("Refresh token required", 400);
    }

    // In a real app, validate refresh token
    // For mock, generate new token
    const token = generateToken("mock_user_id", "student");

    res.json({
      token,
      message: "Token refreshed successfully",
    });
  }),
);

// Password reset request
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Valid email required", 400);
    }

    const { email } = req.body;

    // In a real app, send password reset email
    console.log(`Password reset requested for: ${email}`);

    res.json({
      message: "Password reset instructions sent to your email",
    });
  }),
);

// Verify email endpoint
router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      throw new CustomError("Verification token required", 400);
    }

    // In a real app, verify email token
    res.json({
      message: "Email verified successfully",
    });
  }),
);

// Get current user profile
router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

    // In a real app, fetch from database
    const user = [...mockStudents, ...mockCompanies].find(
      (user) => user._id === userId,
    );

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  }),
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName").optional().trim().isLength({ min: 1 }),
    body("lastName").optional().trim().isLength({ min: 1 }),
    body("bio").optional().isLength({ max: 500 }),
    body("skills").optional().isArray(),
    body("location.city").optional().trim().isLength({ min: 1 }),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const updateData = req.body;

    // In a real app, update user in database
    res.json({
      message: "Profile updated successfully",
      profile: updateData,
    });
  }),
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const { currentPassword, newPassword } = req.body;

    // In a real app, verify current password and update
    const hashedNewPassword = await hashPassword(newPassword);

    res.json({
      message: "Password changed successfully",
    });
  }),
);

// Delete account
router.delete(
  "/account",
  authenticateToken,
  [body("password").notEmpty(), body("confirmation").equals("DELETE")],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const { password } = req.body;

    // In a real app, verify password and delete account
    res.json({
      message: "Account deleted successfully",
    });
  }),
);

// Two-factor authentication setup
router.post(
  "/2fa/setup",
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

    // In a real app, generate 2FA secret and QR code
    const secret = uuidv4();
    const qrCodeUrl = `data:image/png;base64,mock_qr_code`;

    res.json({
      secret,
      qrCodeUrl,
      backupCodes: ["12345678", "87654321", "11111111", "22222222", "33333333"],
    });
  }),
);

// Verify 2FA setup
router.post(
  "/2fa/verify",
  authenticateToken,
  [body("token").isLength({ min: 6, max: 6 })],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const { token } = req.body;

    // In a real app, verify 2FA token
    res.json({
      message: "2FA enabled successfully",
    });
  }),
);

// Company signup
router.post("/company/signup", [
  body("companyName").trim().isLength({ min: 1 }).withMessage("Company name is required"),
  body("industry").trim().isLength({ min: 1 }).withMessage("Industry is required"),
  body("companySize").trim().isLength({ min: 1 }).withMessage("Company size is required"),
  body("firstName").trim().isLength({ min: 1 }).withMessage("First name is required"),
  body("lastName").trim().isLength({ min: 1 }).withMessage("Last name is required"),
  body("position").trim().isLength({ min: 1 }).withMessage("Position is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("address").trim().isLength({ min: 1 }).withMessage("Address is required"),
  body("city").trim().isLength({ min: 1 }).withMessage("City is required"),
  body("postcode").trim().isLength({ min: 1 }).withMessage("Postcode is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("termsAccepted").custom((value) => {
    if (!value || value !== true) {
      throw new Error("Terms of service must be accepted");
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Company signup validation errors:", errors.array());
    throw new CustomError("Validation failed", 400);
  }

  const {
    companyName, industry, companySize, website, description,
    firstName, lastName, position, email,
    address, city, postcode, password,
    termsAccepted, privacyAccepted, noPoacingAccepted,
    exclusivityAccepted, dataProcessingAccepted
  } = req.body;

  // Check if MongoDB is available
  const hasMongoDb = process.env.MONGODB_URI && require('mongoose').connection.readyState === 1;

  if (hasMongoDb) {
    // Real database operations
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new CustomError("User with this email already exists", 400);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user with company profile
      const user = new User({
        email,
        password: hashedPassword,
        role: "company",
        profile: {
          companyName,
          industry,
          description,
          location: {
            city,
            address,
            coordinates: [0, 0] // Would geocode in production
          },
          contactPerson: {
            firstName,
            lastName,
            position
          }
        }
      });

      await user.save();

      // Create trial subscription
      try {
        const { SubscriptionService } = await import('../services/subscriptionService');
        await SubscriptionService.createTrialSubscription(user._id.toString());
      } catch (error) {
        console.log('Trial subscription creation failed (non-critical):', error);
      }

      // Generate token
      const token = generateToken(user._id.toString(), user.role);

      res.status(201).json({
        message: "Company account created successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          companyName: user.profile?.companyName
        }
      });
    } catch (error) {
      console.error('Database error in company signup:', error);
      throw new CustomError("Registration failed. Please try again.", 500);
    }
  } else {
    // Mock data operations (for development)
    // Check if user already exists (mock check)
    const existingUser = [...mockStudents, ...mockCompanies].find(
      (user) => user.email === email
    );

    if (existingUser) {
      throw new CustomError("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create mock user
    const userId = `company_${Date.now()}`;
    const token = generateToken(userId, "company");

    const newCompany = {
      _id: userId,
      email,
      password: hashedPassword,
      role: "company" as const,
      profile: {
        companyName,
        industry,
        description: description || "",
        location: {
          city: city || "",
          address: address || "",
          coordinates: [0, 0] as [number, number]
        },
        contactPerson: {
          firstName,
          lastName,
          position: position || "",
        },
        isVerified: false,
      },
      isEmailVerified: false,
    };

    // Add to mock companies array
    mockCompanies.push(newCompany);

    res.status(201).json({
      message: "Company account created successfully",
      token,
      user: {
        id: userId,
        email,
        role: "company",
        companyName
      }
    });
  }
}));

// Company signin
router.post("/company/signin", [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Company signin validation errors:", errors.array());
    throw new CustomError("Validation failed", 400);
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email, role: "company" });
  if (!user) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.role);

  res.json({
    message: "Sign in successful",
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      companyName: user.profile?.companyName
    }
  });
}));

export default router;
