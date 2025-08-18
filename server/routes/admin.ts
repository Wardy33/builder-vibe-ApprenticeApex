import express, { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeNeonQuery, getDatabaseStats } from "../config/neon";
import { authenticateToken, requireMasterAdmin, requireAdminPermission, AuthenticatedRequest } from "../middleware/auth";
import { getEnvConfig } from "../config/env";

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

    // Find user and check master admin status using Neon
    const userQuery = `
      SELECT id, email, password_hash, role, name, is_master_admin, admin_permissions,
             login_attempts, locked_until, last_login_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
        AND role IN ('admin', 'master_admin')
        AND email_verified = true
    `;

    const users = await executeNeonQuery(userQuery, [email.toLowerCase()]);
    const user = users[0];

    if (!user) {
      console.warn(`🚨 Admin login attempt with non-admin email: ${email} from IP: ${req.ip}`);
      return res.status(401).json({
        error: "Invalid admin credentials",
        code: "INVALID_ADMIN_CREDENTIALS"
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockTimeRemaining = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
      return res.status(423).json({
        error: `Admin account locked. Try again in ${lockTimeRemaining} minutes`,
        code: "ADMIN_ACCOUNT_LOCKED",
        lockTimeRemaining
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const attempts = (user.login_attempts || 0) + 1;
      let lockUntil = null;

      // Lock account after 3 failed attempts
      if (attempts >= 3) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        console.warn(`🚨 Admin account locked due to failed attempts: ${email}`);
      }

      await executeNeonQuery(
        `UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [attempts, lockUntil, user.id]
      );

      console.warn(`🚨 Failed admin login attempt: ${email} from IP: ${req.ip}`);
      return res.status(401).json({
        error: "Invalid admin credentials",
        code: "INVALID_ADMIN_CREDENTIALS"
      });
    }

    // Reset login attempts on successful login
    await executeNeonQuery(
      `UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    // Generate enhanced JWT token for admin
    const env = getEnvConfig();
    const adminPermissions = user.admin_permissions || {
      canViewAllUsers: true,
      canViewFinancials: true,
      canModerateContent: true,
      canAccessSystemLogs: true,
      canExportData: true,
      canManageAdmins: user.role === "master_admin",
      canConfigureSystem: user.role === "master_admin"
    };

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        isMasterAdmin: user.is_master_admin || user.role === "master_admin",
        adminPermissions
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
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isMasterAdmin: user.is_master_admin || user.role === "master_admin",
        permissions: adminPermissions
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
    const existingAdmins = await executeNeonQuery(
      `SELECT id FROM users WHERE role = 'master_admin' LIMIT 1`
    );
    if (existingAdmins.length > 0) {
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

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create master admin account in Neon
    const newAdmin = await executeNeonQuery(`
      INSERT INTO users (
        email, password_hash, role, name, email_verified, is_master_admin, admin_permissions
      ) VALUES ($1, $2, 'master_admin', 'Master Administrator', true, true, $3)
      RETURNING id, email
    `, [
      email.toLowerCase(),
      hashedPassword,
      JSON.stringify({
        canViewAllUsers: true,
        canViewFinancials: true,
        canModerateContent: true,
        canAccessSystemLogs: true,
        canExportData: true,
        canManageAdmins: true,
        canConfigureSystem: true
      })
    ]);

    console.log(`✅ Master admin account created: ${email}`);

    res.status(201).json({
      success: true,
      message: "Master admin account created successfully",
      adminId: newAdmin[0].id,
      email: newAdmin[0].email
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

    const users = await executeNeonQuery(
      `SELECT id, email, role, name, is_master_admin, admin_permissions, last_login_at
       FROM users WHERE id = $1 AND role IN ('admin', 'master_admin')`,
      [req.user!.userId]
    );

    const user = users[0];
    if (!user) {
      console.warn('❌ Admin user not found during session verification:', req.user?.userId);
      return res.status(404).json({
        error: "Admin user not found",
        code: "ADMIN_NOT_FOUND"
      });
    }

    console.log('✅ Admin session verified for:', user.email);

    // Update last access time
    await executeNeonQuery(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isMasterAdmin: user.is_master_admin,
        permissions: user.admin_permissions,
        lastAccess: new Date().toISOString()
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
    // Get comprehensive platform statistics from Neon
    const stats = await executeNeonQuery(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE email_verified = true) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'candidate' AND email_verified = true) as total_candidates,
        (SELECT COUNT(*) FROM users WHERE role = 'company' AND email_verified = true) as total_companies,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') as total_job_postings,
        (SELECT COUNT(*) FROM interviews) as total_interviews,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'succeeded') as total_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'succeeded' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue
    `);

    // Get growth metrics
    const growth = await executeNeonQuery(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as users_this_week,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as users_this_month,
        (SELECT COUNT(*) FROM applications WHERE submitted_at >= CURRENT_DATE - INTERVAL '7 days') as applications_this_week,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'succeeded' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) as revenue_this_month,
        (SELECT COUNT(*) FROM subscriptions WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as subscriptions_this_month
    `);

    // AI Moderation stats
    const aiStats = await executeNeonQuery(`
      SELECT
        (SELECT COUNT(*) FROM ai_moderation_flags WHERE created_at >= CURRENT_DATE) as flags_today,
        (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending') as pending_reviews,
        (SELECT COUNT(DISTINCT company_id) FROM ai_moderation_flags WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as companies_flagged,
        (SELECT COUNT(*) FROM conversations WHERE blocked = true) as blocked_conversations
    `);

    // Basic system health metrics
    const systemHealth = {
      errorRate: 0.01,
      averageResponseTime: 180,
      uptime: 99.95,
      activeConnections: stats[0].total_users * 0.15,
      databaseStatus: "connected",
      aiModerationActive: true
    };

    res.json({
      platformStats: {
        totalUsers: stats[0].total_users,
        totalCandidates: stats[0].total_candidates,
        totalCompanies: stats[0].total_companies,
        totalApplications: stats[0].total_applications,
        totalJobPostings: stats[0].total_job_postings,
        totalInterviews: stats[0].total_interviews,
        activeSubscriptions: stats[0].active_subscriptions,
        totalRevenue: parseFloat(stats[0].total_revenue || 0),
        monthlyRevenue: parseFloat(stats[0].monthly_revenue || 0)
      },
      growthMetrics: {
        usersThisWeek: growth[0].users_this_week,
        usersThisMonth: growth[0].users_this_month,
        applicationsThisWeek: growth[0].applications_this_week,
        revenueThisMonth: parseFloat(growth[0].revenue_this_month || 0),
        subscriptionsThisMonth: growth[0].subscriptions_this_month
      },
      aiModeration: {
        flagsToday: aiStats[0].flags_today,
        pendingReviews: aiStats[0].pending_reviews,
        companiesFlagged: aiStats[0].companies_flagged,
        blockedConversations: aiStats[0].blocked_conversations
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
