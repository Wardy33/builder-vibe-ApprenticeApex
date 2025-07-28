import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import compression from "compression";
import { validateEnv } from "./config/env";
import { connectToDatabase } from "./index";
import { errorHandler } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";

dotenv.config();

async function startSimpleServer() {
  const PORT = 3001;
  console.log('🚀 Starting Simple Standalone Express Server...');
  
  try {
    // Validate environment (with fallback)
    let env: any;
    try {
      env = validateEnv();
    } catch (error) {
      console.warn("⚠️ Environment validation skipped in development mode");
      env = {
        NODE_ENV: process.env.NODE_ENV || "development",
        PORT: Number(process.env.PORT) || 3001,
        FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5204",
        MONGODB_URI: process.env.MONGODB_URI || "",
        JWT_SECRET: process.env.JWT_SECRET || "development-secret-key-minimum-32-characters-long-for-security",
      };
    }

    // Create Express app
    const app = express();
    const httpServer = createServer(app);

    // Trust proxy
    app.set("trust proxy", 1);

    // Compression middleware
    app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
      memLevel: 8,
    }));

    // Basic middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Basic CORS for development
    app.use((req: any, res: any, next: any) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      res.header("Access-Control-Allow-Methods", "*");
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Health check endpoints
    app.get("/api/ping", (_req, res) => {
      res.json({
        message: "ApprenticeApex API v1.0",
        timestamp: new Date().toISOString(),
        status: "healthy",
      });
    });

    // Enhanced health check routes
    app.use("/api/health", healthRoutes);

    // Public routes
    app.use("/api/auth", authRoutes);

    // Error handling middleware
    app.use(errorHandler);

    // 404 handler
    app.use("/api/*", (_req, res) => {
      res.status(404).json({ error: "API endpoint not found" });
    });

    // Connect to database (optional)
    try {
      const dbConnected = await connectToDatabase();
      console.log(dbConnected ? '✅ Database connected' : '⚠️ Using mock data');
    } catch (error) {
      console.warn('⚠️ Database failed, continuing with mock data');
    }
    
    httpServer.listen(PORT, () => {
      console.log(`✅ API Server running on port ${PORT}`);
      console.log(`🧪 Test: http://localhost:${PORT}/api/auth/test`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/ping`);
      console.log(`📋 Registration: http://localhost:${PORT}/api/auth/register`);
    });

    // Handle server errors
    httpServer.on('error', (error: any) => {
      console.error('❌ Server error:', error.message);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to create server:', error.message);
    process.exit(1);
  }
}

startSimpleServer().catch(console.error);
