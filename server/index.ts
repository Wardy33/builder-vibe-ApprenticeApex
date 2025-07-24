import express from "express";
import mongoose from "mongoose";

// Import production database configuration
import { database, connectDatabase } from "./config/database";
import { initializeIndexes } from "./config/indexes";
import { databaseMiddleware, databaseHealthCheck, optimizeQueries } from "./middleware/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { createServer } from "http";
import dotenv from "dotenv";
import session from "express-session";

// Import security middleware
import {
  helmetConfig,
  createRateLimit,
  secureRoutes,
  securityLogger,
} from "./middleware/security";

// Import environment validation
import { validateEnv, getEnvConfig } from "./config/env";

// Import routes
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import apprenticeshipRoutes from "./routes/apprenticeships";
import applicationRoutes from "./routes/applications";
import messageRoutes from "./routes/messages";
import analyticsRoutes from "./routes/analytics";
import uploadRoutes from "./routes/upload";
import paymentRoutes from "./routes/payments";
import interviewRoutes from "./routes/interviews";
import matchingRoutes from "./routes/matching";
import accessControlRoutes from "./routes/accessControl";
import alertRoutes from "./routes/alerts";
import subscriptionRoutes from "./routes/subscriptions";
import contactRoutes from "./routes/contact";
import testRoutes from "./routes/test";
import testEndpointRoutes from "./routes/testEndpoints";
import healthRoutes from "./routes/health";
import stripeRoutes from "./routes/stripe";
import emailRoutes from "./routes/emails";

// Import middleware
import { authenticateToken } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

// Import Socket.IO setup
import { initializeSocket } from "./socket/chat";

// Import alert system
import { AlertService } from "./services/alertService";

// Load environment variables
dotenv.config();

// Validate environment variables on startup (skip in Vite dev mode)
let env: any;
try {
  env = validateEnv();
} catch (error) {
  console.warn('⚠️  Environment validation skipped in development mode');
  env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 3001,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/apprenticeapex',
    JWT_SECRET: process.env.JWT_SECRET || 'development-secret-key-minimum-32-characters-long-for-security',
    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  };
}

export function createApp() {
  const app = express();
  const httpServer = createServer(app);

  // Initialize Socket.IO
  const io = initializeSocket(httpServer);

  // Make io available in request context
  app.set("io", io);

  // Trust proxy (important for rate limiting and IP detection)
  app.set('trust proxy', 1);

  // Basic middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Database middleware
  app.use(databaseHealthCheck());
  app.use(optimizeQueries());

  // Apply security middleware only if environment is properly validated
  if (env.NODE_ENV && typeof env.JWT_SECRET === 'string' && env.JWT_SECRET.length >= 32) {
    // Security middleware (applied first)
    app.use(securityLogger());
    app.use(helmetConfig);
    // Basic CORS for development
    app.use((req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Methods', '*');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Session configuration for CSRF protection
    app.use(session({
      secret: env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }));

    // Security routes middleware
    app.use(secureRoutes());
  } else {
    console.warn('⚠️  Security middleware disabled in development mode');
    // Basic CORS for development
    app.use((req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Methods', '*');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  // Health check endpoints
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "ApprenticeApex API v1.0",
      timestamp: new Date().toISOString(),
      status: "healthy",
    });
  });

  // Comprehensive health check
  app.get("/api/health", async (_req, res) => {
    const dbStatus = database.getHealthStatus();
    const performanceMonitor = databaseMiddleware.monitor;
    const healthStatus = performanceMonitor.getHealthStatus();

    res.json({
      status: dbStatus.status === 'healthy' && healthStatus.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      performance: healthStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "1.0.0"
    });
  });

  // Enhanced health check routes
  app.use("/api/health", healthRoutes);

  // Rate limiting (only if security middleware is enabled)
  if (env.NODE_ENV && typeof env.JWT_SECRET === 'string' && env.JWT_SECRET.length >= 32) {
    app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5)); // Auth rate limit
    app.use('/api/payments', createRateLimit(60 * 60 * 1000, 10)); // Payment rate limit
    app.use('/api', createRateLimit());
  }

  // Public routes
  app.use("/api/auth", authRoutes);

  // Protected routes (require authentication)
  app.use("/api/users", authenticateToken, userRoutes);
  app.use("/api/apprenticeships", authenticateToken, apprenticeshipRoutes);
  app.use("/api/applications", authenticateToken, applicationRoutes);
  app.use("/api/messages", authenticateToken, messageRoutes);
  app.use("/api/analytics", authenticateToken, analyticsRoutes);
  app.use("/api/upload", authenticateToken, uploadRoutes);
  app.use("/api/payments", paymentRoutes); // Some endpoints require auth, handled individually
  app.use("/api/stripe", stripeRoutes); // Stripe webhooks and utilities
  app.use("/api/interviews", authenticateToken, interviewRoutes);
  app.use("/api/matching", authenticateToken, matchingRoutes);
  app.use("/api/access-control", authenticateToken, accessControlRoutes);
  app.use("/api/alerts", authenticateToken, alertRoutes);
  app.use("/api/subscriptions", authenticateToken, subscriptionRoutes);
  app.use("/api/contact", contactRoutes); // Public route, no auth required

  // Database testing routes (development and staging only)
  if (env.NODE_ENV !== 'production') {
    app.use("/api/test", testRoutes);
    app.use("/api/test", testEndpointRoutes);
    console.log('🧪 Database test endpoints enabled at /api/test/*');
  }

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // Error handling middleware
  app.use(errorHandler);

  // 404 handler
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  return { app, httpServer, io };
}

// Production-ready database connection
export async function connectToDatabase() {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️  MONGODB_URI not provided. Using development mode with mock data.");
      console.log("🗄️  Database connection established (mock)");
      return true;
    }

    // Connect to production MongoDB
    await database.connect();

    // Initialize database indexes
    await initializeIndexes();

    // Initialize alert system after database connection
    AlertService.initialize();
    AlertService.integrateWithMonitoring();
    console.log("🚨 Anti-poaching alert system initialized");

    // Register graceful shutdown handlers
    database.registerShutdownHandler(async () => {
      console.log("🚨 Shutting down alert system...");
      // Add any alert system cleanup here
    });

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Legacy function for backwards compatibility
export async function connectDatabase() {
  return connectToDatabase();
}

// Export environment config for other modules
export { getEnvConfig };

// Legacy exports for backwards compatibility (will be removed)
export const JWT_SECRET = env.JWT_SECRET;
export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  mongoUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  stripe: {
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
  daily: {
    apiKey: env.DAILY_API_KEY,
    domainName: env.DAILY_DOMAIN_NAME,
  },
  email: {
    service: env.EMAIL_SERVICE,
    user: env.EMAIL_USER,
    password: env.EMAIL_PASSWORD,
    from: env.EMAIL_FROM,
  },
  frontend: {
    url: env.FRONTEND_URL,
  },
};

export function generateToken(userId: string, role: 'student' | 'company' | 'admin', email: string): string {
  return jwt.sign({ userId, role, email }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; role: string; email: string; iat: number; exp: number } {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string; email: string; iat: number; exp: number };
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Mock data generators for development
export const mockStudents = [
  {
    _id: "student1",
    email: "sarah.johnson@email.com",
    password: "password123", // For testing - would be hashed in real app
    role: "student",
    profile: {
      firstName: "Sarah",
      lastName: "Johnson",
      bio: "Passionate about technology and eager to start my career in software development.",
      skills: ["JavaScript", "React", "Node.js", "Problem Solving"],
      hasDriversLicense: true,
      assistedNeeds: "",
      location: {
        city: "London",
        postcode: "SW1A 1AA",
        coordinates: [-0.1276, 51.5074],
      },
      preferences: {
        industries: ["Technology", "Finance"],
        maxDistance: 25,
        salaryRange: { min: 18000, max: 25000 },
      },
      workType: "full-time",
      transportModes: ["Public Transport", "Car/Driving"],
      isActive: true,
    },
  },
  {
    _id: "student2",
    email: "mike.chen@email.com",
    password: "password123",
    role: "student",
    profile: {
      firstName: "Mike",
      lastName: "Chen",
      bio: "Creative marketing enthusiast with social media expertise.",
      skills: [
        "Digital Marketing",
        "Social Media",
        "Content Creation",
        "Analytics",
      ],
      hasDriversLicense: false,
      assistedNeeds: "",
      location: {
        city: "Manchester",
        postcode: "M1 1AA",
        coordinates: [-2.2426, 53.4808],
      },
      preferences: {
        industries: ["Marketing", "Retail"],
        maxDistance: 30,
        salaryRange: { min: 16000, max: 22000 },
      },
      workType: "both",
      transportModes: ["Public Transport", "Cycling"],
      isActive: true,
    },
  },
];

export const mockCompanies = [
  {
    _id: "company1",
    email: "hr@techcorp.com",
    password: "password123", // For testing - would be hashed in real app
    role: "company",
    profile: {
      companyName: "TechCorp Ltd",
      industry: "Technology",
      description:
        "Leading software development company specializing in web applications.",
      location: { city: "London", coordinates: [-0.1276, 51.5074] },
      contactPerson: {
        firstName: "Emma",
        lastName: "Wilson",
        position: "HR Manager",
      },
    },
  },
  {
    _id: "company2",
    email: "admin@creativeagency.com",
    password: "password123",
    role: "company",
    profile: {
      companyName: "Creative Agency",
      industry: "Marketing",
      description:
        "Full-service marketing agency specializing in digital marketing and brand development.",
      location: { city: "Manchester", coordinates: [-2.2426, 53.4808] },
      contactPerson: {
        firstName: "David",
        lastName: "Brown",
        position: "Recruitment Manager",
      },
    },
  },
  {
    _id: "company3",
    email: "test@company.com",
    password: "password123",
    role: "company",
    profile: {
      companyName: "Test Company Ltd",
      industry: "Technology",
      description: "Test company for authentication testing.",
      location: { city: "London", coordinates: [-0.1276, 51.5074] },
      contactPerson: {
        firstName: "Test",
        lastName: "User",
        position: "Test Manager",
      },
    },
  },
];

export const mockApprenticeships = [
  {
    _id: "app1",
    companyId: "company1",
    jobTitle: "Software Developer Apprentice",
    description:
      "Join our dynamic team and learn cutting-edge web development technologies. You'll work on real projects from day one and receive mentorship from senior developers.",
    industry: "Technology",
    location: {
      city: "London",
      address: "123 Tech Street, London",
      postcode: "SW1A 2AA",
      coordinates: [-0.1276, 51.5074],
    },
    requirements: [
      "Basic programming knowledge",
      "Problem-solving skills",
      "Passion for technology",
      "Good communication skills",
    ],
    duration: { years: 3, months: 0 },
    salary: { min: 18000, max: 25000, currency: "GBP" },
    workType: "full-time",
    drivingLicenseRequired: false,
    accessibilitySupport: true,
    skills: ["JavaScript", "React", "HTML", "CSS"],
    applicationCount: 45,
    viewCount: 180,
    isActive: true,
    swipeStats: { totalSwipes: 120, rightSwipes: 45, leftSwipes: 75 },
  },
  {
    _id: "app2",
    companyId: "company1",
    jobTitle: "Digital Marketing Apprentice",
    description:
      "Learn the fundamentals of digital marketing including SEO, social media, and content creation in our award-winning marketing team.",
    industry: "Marketing",
    location: {
      city: "Manchester",
      address: "456 Creative Ave, Manchester",
      postcode: "M1 2AA",
      coordinates: [-2.2426, 53.4808],
    },
    requirements: [
      "Creative mindset",
      "Social media knowledge",
      "Strong communication skills",
      "Interest in digital trends",
    ],
    duration: { years: 2, months: 0 },
    salary: { min: 16000, max: 22000, currency: "GBP" },
    workType: "both",
    drivingLicenseRequired: false,
    accessibilitySupport: true,
    skills: ["Social Media", "Content Creation", "Analytics"],
    applicationCount: 32,
    viewCount: 125,
    isActive: true,
    swipeStats: { totalSwipes: 85, rightSwipes: 32, leftSwipes: 53 },
  },
  {
    _id: "app3",
    companyId: "company1",
    jobTitle: "Delivery Driver Apprentice",
    description:
      "Learn logistics and delivery operations while earning. Perfect for those who enjoy driving and customer service.",
    industry: "Retail",
    location: {
      city: "Birmingham",
      address: "789 Delivery Hub, Birmingham",
      postcode: "B1 1AA",
      coordinates: [-1.8904, 52.4862],
    },
    requirements: [
      "Customer service skills",
      "Reliable and punctual",
      "Physical fitness",
      "Good communication",
    ],
    duration: { years: 1, months: 6 },
    salary: { min: 19000, max: 23000, currency: "GBP" },
    workType: "full-time",
    drivingLicenseRequired: true,
    accessibilitySupport: false,
    skills: ["Customer Service", "Time Management"],
    applicationCount: 28,
    viewCount: 95,
    isActive: true,
    swipeStats: { totalSwipes: 65, rightSwipes: 28, leftSwipes: 37 },
  },
];
