import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { createServer } from "http";
import dotenv from "dotenv";

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

// Import middleware
import { authenticateToken } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

// Import Socket.IO setup
import { initializeSocket } from "./socket/chat";

// Load environment variables
dotenv.config();

export function createApp() {
  const app = express();
  const httpServer = createServer(app);

  // Initialize Socket.IO
  const io = initializeSocket(httpServer);

  // Make io available in request context
  app.set("io", io);

  // Middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:8080",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Trust proxy for production
  app.set("trust proxy", 1);

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "ApprenticeApex API v1.0",
      timestamp: new Date().toISOString(),
      status: "healthy",
    });
  });

  // Public routes
  app.use("/api/auth", authRoutes);

  // Protected routes (require authentication)
  app.use("/api/users", authenticateToken, userRoutes);
  app.use("/api/apprenticeships", authenticateToken, apprenticeshipRoutes);
  app.use("/api/applications", authenticateToken, applicationRoutes);
  app.use("/api/messages", authenticateToken, messageRoutes);
  app.use("/api/analytics", authenticateToken, analyticsRoutes);
  app.use("/api/upload", authenticateToken, uploadRoutes);
  app.use("/api/payments", authenticateToken, paymentRoutes);
  app.use("/api/interviews", authenticateToken, interviewRoutes);
  app.use("/api/matching", authenticateToken, matchingRoutes);

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

// Database connection
export async function connectDatabase() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/apprenticeapex";

    if (process.env.NODE_ENV === "production" && process.env.MONGODB_URI) {
      await mongoose.connect(mongoUri, {
        retryWrites: true,
        w: "majority",
      });
      console.log("🗄️  Database connection established (MongoDB)");
    } else {
      // For development, we'll use a mock connection
      console.log("🗄️  Database connection established (mock)");
    }
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// JWT utilities
export const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Environment configuration
export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/apprenticeapex",
  jwtSecret: JWT_SECRET,
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    apiKey: process.env.TWILIO_API_KEY,
    apiSecret: process.env.TWILIO_API_SECRET,
  },
  daily: {
    apiKey: process.env.DAILY_API_KEY,
    domainName: process.env.DAILY_DOMAIN_NAME,
  },
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@apprenticeapex.com",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
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
