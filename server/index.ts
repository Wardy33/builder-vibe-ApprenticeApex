import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

// Import routes
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import apprenticeshipRoutes from "./routes/apprenticeships";
import applicationRoutes from "./routes/applications";
import messageRoutes from "./routes/messages";
import analyticsRoutes from "./routes/analytics";
import uploadRoutes from "./routes/upload";

// Import middleware
import { authenticateToken } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "ApprenticeMatch API v1.0",
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

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // Error handling middleware
  app.use(errorHandler);

  // 404 handler
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  return app;
}

// Database connection (mock for development)
export async function connectDatabase() {
  try {
    // In production, this would be:
    // await mongoose.connect(process.env.MONGODB_URI!);

    // For development, we'll use a mock connection
    console.log("🗄️  Database connection established (mock)");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// JWT utilities
export const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

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
      location: { city: "London", coordinates: [-0.1276, 51.5074] },
      preferences: {
        industries: ["Technology", "Finance"],
        maxDistance: 25,
        salaryRange: { min: 18000, max: 25000 },
      },
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
      location: { city: "Manchester", coordinates: [-2.2426, 53.4808] },
      preferences: {
        industries: ["Marketing", "Retail"],
        maxDistance: 30,
        salaryRange: { min: 16000, max: 22000 },
      },
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
    applicationCount: 45,
    viewCount: 180,
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
    applicationCount: 32,
    viewCount: 125,
    swipeStats: { totalSwipes: 85, rightSwipes: 32, leftSwipes: 53 },
  },
];
