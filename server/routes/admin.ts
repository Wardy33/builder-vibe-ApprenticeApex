import express, { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authenticateToken, requireMasterAdmin, requireAdminPermission, AuthenticatedRequest } from "../middleware/auth";
import { getEnvConfig } from "../config/env";
import { database } from "../config/database";
import mongoose from "mongoose";

// Import sub-admin routes
import adminUsersRouter from "./adminUsers";
import adminAnalyticsRouter from "./adminAnalytics";
import adminSystemRouter from "./adminSystem";

const router = Router();

console.log('🔧 Admin routes module loading...');
console.log('🔧 Router created successfully');

// Add a simple test route to verify admin routes are mounted
router.get("/test", (req: Request, res: Response) => {
  console.log('🧪 Admin test route accessed');
  res.json({
    success: true,
    message: "Admin routes are working!",
    timestamp: new Date().toISOString()
  });
});

// Master Admin Login - Enhanced Security
router.post("/login", async (req: Request, res: Response) => {
  try {
    console.log('🔥 *** ADMIN LOGIN ROUTE HIT ***');
    console.log('🔐 Admin login attempt received');
    console.log('🔐 Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔐 Request body exists:', !!req.body);
    console.log('🔐 Request body type:', typeof req.body);

    // Ensure we have a valid request body
    if (!req.body || typeof req.body !== 'object') {
      console.error('❌ Invalid request body for admin login');
      return res.status(400).json({
        error: "Invalid request body",
        code: "INVALID_BODY"
      });
    }

    const { email, password, adminCode } = req.body;
    console.log('🔐 Extracted credentials:', {
      email: email ? email : 'missing',
      hasPassword: !!password,
      hasAdminCode: !!adminCode
    });

    if (!email || !password) {
      console.warn('❌ Missing email or password in admin login');
      return res.status(400).json({
        error: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Check for admin access code (additional security layer)
    const expectedAdminCode = process.env.MASTER_ADMIN_CODE || "APEX2024";
    if (adminCode !== expectedAdminCode) {
      console.warn(`🚨 Invalid admin code attempt from IP: ${req.ip}, email: ${email}`);
      return res.status(403).json({
        error: "Invalid admin access code",
        code: "INVALID_ADMIN_CODE"
      });
    }

    // Find user and check master admin status
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: { $in: ["admin", "master_admin"] },
      isActive: true
    });

    if (!user) {
      console.warn(`🚨 Admin login attempt with non-admin email: ${email} from IP: ${req.ip}`);
      return res.status(401).json({
        error: "Invalid admin credentials",
        code: "INVALID_ADMIN_CREDENTIALS"
      });
    }

    // Check if account is locked
    if (user.adminLoginLockedUntil && user.adminLoginLockedUntil > new Date()) {
      const lockTimeRemaining = Math.ceil((user.adminLoginLockedUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        error: `Admin account locked. Try again in ${lockTimeRemaining} minutes`,
        code: "ADMIN_ACCOUNT_LOCKED",
        lockTimeRemaining
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.adminLoginAttempts = (user.adminLoginAttempts || 0) + 1;
      
      // Lock account after 3 failed attempts
      if (user.adminLoginAttempts >= 3) {
        user.adminLoginLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        console.warn(`🚨 Admin account locked due to failed attempts: ${email}`);
      }
      
      await user.save();
      
      console.warn(`🚨 Failed admin login attempt: ${email} from IP: ${req.ip}`);
      return res.status(401).json({
        error: "Invalid admin credentials",
        code: "INVALID_ADMIN_CREDENTIALS"
      });
    }

    // Reset login attempts on successful login
    user.adminLoginAttempts = 0;
    user.adminLoginLockedUntil = undefined;
    user.lastLogin = new Date();
    user.lastAccessedAdminPanel = new Date();
    await user.save();

    // Generate enhanced JWT token for admin
    const env = getEnvConfig();
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
        isMasterAdmin: user.isMasterAdmin || user.role === "master_admin",
        adminPermissions: user.adminPermissions || {
          canViewAllUsers: true,
          canViewFinancials: true,
          canModerateContent: true,
          canAccessSystemLogs: true,
          canExportData: true,
          canManageAdmins: user.role === "master_admin",
          canConfigureSystem: user.role === "master_admin"
        }
      },
      env.JWT_SECRET,
      { expiresIn: "8h" } // Shorter expiry for admin tokens
    );

    console.log(`✅ Admin login successful: ${email} (${user.role}) from IP: ${req.ip}`);

    // Ensure response is properly formatted JSON
    const responseData = {
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isMasterAdmin: user.isMasterAdmin || user.role === "master_admin",
        permissions: user.adminPermissions,
        profile: user.profile
      }
    };

    console.log('🔐 Sending admin login response:', { success: true, userEmail: email, hasToken: !!token });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ Admin login error:", error);
    console.error("❌ Error stack:", error.stack);

    // Ensure we always send valid JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      error: "Admin login failed",
      code: "ADMIN_LOGIN_ERROR",
      message: error.message || 'Unknown server error'
    });
  }
});

// Create Master Admin Account (One-time setup)
router.post("/setup-master-admin", async (req: Request, res: Response) => {
  try {
    const { email, password, setupCode } = req.body;

    // Check if master admin already exists
    const existingMasterAdmin = await User.findOne({ role: "master_admin" });
    if (existingMasterAdmin) {
      return res.status(409).json({
        error: "Master admin already exists",
        code: "MASTER_ADMIN_EXISTS"
      });
    }

    // Verify setup code (should be provided securely)
    const expectedSetupCode = process.env.MASTER_ADMIN_SETUP_CODE || "SETUP_APEX_2024";
    if (setupCode !== expectedSetupCode) {
      console.warn(`🚨 Invalid master admin setup attempt from IP: ${req.ip}`);
      return res.status(403).json({
        error: "Invalid setup code",
        code: "INVALID_SETUP_CODE"
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        code: "INVALID_EMAIL"
      });
    }

    // Create master admin account
    const masterAdmin = new User({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      role: "master_admin",
      isMasterAdmin: true,
      isEmailVerified: true, // Master admin doesn't need email verification
      isActive: true,
      adminPermissions: {
        canViewAllUsers: true,
        canViewFinancials: true,
        canModerateContent: true,
        canAccessSystemLogs: true,
        canExportData: true,
        canManageAdmins: true,
        canConfigureSystem: true
      },
      profile: {
        firstName: "Master",
        lastName: "Admin",
        position: "Platform Administrator",
        department: "System Administration",
        permissions: {
          users: true,
          content: true,
          financial: true,
          analytics: true,
          system: true
        },
        lastAccess: new Date(),
        twoFactorEnabled: false,
        adminLevel: "master_admin"
      }
    });

    await masterAdmin.save();

    console.log(`✅ Master admin account created: ${email}`);

    res.status(201).json({
      success: true,
      message: "Master admin account created successfully",
      adminId: masterAdmin._id,
      email: masterAdmin.email
    });

  } catch (error) {
    console.error("❌ Master admin setup error:", error);
    res.status(500).json({
      error: "Failed to create master admin account",
      code: "MASTER_ADMIN_SETUP_ERROR"
    });
  }
});

// Verify Admin Session
router.get("/verify-session", authenticateToken, requireMasterAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔍 Admin session verification for user:', req.user?.userId);

    const user = await User.findById(req.user!.userId).select("-password -emailVerificationToken -passwordResetToken");

    if (!user) {
      console.warn('❌ Admin user not found during session verification:', req.user?.userId);
      return res.status(404).json({
        error: "Admin user not found",
        code: "ADMIN_NOT_FOUND"
      });
    }

    console.log('✅ Admin session verified for:', user.email);

    // Update last access time
    user.lastAccessedAdminPanel = new Date();
    await user.save();

    const responseData = {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isMasterAdmin: user.isMasterAdmin,
        permissions: user.adminPermissions,
        profile: user.profile,
        lastAccess: user.lastAccessedAdminPanel
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ Admin session verification error:", error);
    console.error("❌ Error stack:", error.stack);

    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      error: "Session verification failed",
      code: "SESSION_VERIFICATION_ERROR",
      message: error.message || 'Unknown verification error'
    });
  }
});

// Admin Logout
router.post("/logout", authenticateToken, requireMasterAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a more advanced implementation, you would invalidate the JWT token
    // For now, we'll just log the logout action
    console.log(`📝 Admin logout: ${req.user!.email}`);

    res.json({
      success: true,
      message: "Admin logout successful"
    });

  } catch (error) {
    console.error("❌ Admin logout error:", error);
    res.status(500).json({
      error: "Logout failed",
      code: "ADMIN_LOGOUT_ERROR"
    });
  }
});

// Dashboard Overview (Main admin dashboard data)
router.get("/dashboard/overview", authenticateToken, requireMasterAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = database.getDb();
    
    // Platform Statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalStudents = await User.countDocuments({ role: "student", isActive: true });
    const totalCompanies = await User.countDocuments({ role: "company", isActive: true });
    
    // Get recent registrations (this week and month)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const usersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: oneWeekAgo },
      isActive: true 
    });
    
    const usersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: oneMonthAgo },
      isActive: true 
    });

    // Basic system health metrics
    const systemHealth = {
      errorRate: 0.02, // This would come from monitoring service
      averageResponseTime: 245,
      uptime: 99.9,
      activeConnections: totalUsers * 0.1, // Estimate
      databaseStatus: database.isConnected() ? "connected" : "disconnected"
    };

    res.json({
      platformStats: {
        totalUsers,
        totalStudents,
        totalCompanies,
        totalApplications: 0, // Will be populated when Application model is connected
        totalJobPostings: 0, // Will be populated when Job model is connected
        totalInterviews: 0, // Will be populated when Interview model is connected
        activeSubscriptions: Math.floor(totalCompanies * 0.3), // Estimate
        totalRevenue: 0, // Will be populated from payment records
        monthlyRevenue: 0 // Will be populated from payment records
      },
      growthMetrics: {
        usersThisWeek,
        usersThisMonth,
        applicationsThisWeek: 0, // To be populated
        revenueThisMonth: 0, // To be populated
        subscriptionsThisMonth: 0 // To be populated
      },
      systemHealth,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Dashboard overview error:", error);
    res.status(500).json({
      error: "Failed to load dashboard overview",
      code: "DASHBOARD_OVERVIEW_ERROR"
    });
  }
});

// Mount sub-admin routes
router.use("/users", adminUsersRouter);
router.use("/analytics", adminAnalyticsRouter);
router.use("/system", adminSystemRouter);

console.log('🔧 Admin routes configured successfully');
console.log('🔧 Available admin routes: login, setup-master-admin, verify-session, logout, dashboard/overview');

export default router;
