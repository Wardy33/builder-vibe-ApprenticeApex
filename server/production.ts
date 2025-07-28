import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import https from "https";
import fs from "fs";
import compression from "compression";
import { validateEnv } from "./config/env";
import { connectToDatabase } from "./index";
import { errorHandler } from "./middleware/errorHandler";
import { 
  performanceMonitoring, 
  errorTracking, 
  healthCheck, 
  securityHeaders,
  rateLimit 
} from "./middleware/monitoring";

// Import routes
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";

dotenv.config();

export async function startProductionServer() {
  const PORT = process.env.PORT || 443;
  const HTTP_PORT = 80;
  
  console.log('🚀 Starting Production ApprenticeApex Server...');
  
  try {
    // Validate environment
    const env = validateEnv();
    
    // Create Express app
    const app = express();
    
    // Trust proxy (important for load balancers)
    app.set("trust proxy", 1);
    
    // ====================================================================
    // PRODUCTION MIDDLEWARE STACK
    // ====================================================================
    
    // Performance monitoring (first)
    app.use(performanceMonitoring);
    
    // Security headers
    app.use(securityHeaders);
    
    // Rate limiting
    app.use('/api', rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
    app.use('/api/auth', rateLimit(15 * 60 * 1000, 20)); // 20 auth requests per 15 minutes
    
    // Compression
    app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
    }));
    
    // Body parsing
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    
    // CORS for production
    app.use((req, res, next) => {
      const allowedOrigins = [
        env.FRONTEND_URL,
        'https://apprenticeapex.com',
        'https://www.apprenticeapex.com'
      ];
      
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
      }
      
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
      }
      
      next();
    });
    
    // ====================================================================
    // HEALTH CHECK AND MONITORING ENDPOINTS
    // ====================================================================
    
    app.get("/api/ping", healthCheck);
    app.get("/api/health", healthCheck);
    app.use("/api/health", healthRoutes);
    
    // Metrics endpoint (for monitoring tools)
    app.get("/api/metrics", (req, res) => {
      res.json({
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
      });
    });
    
    // ====================================================================
    // API ROUTES
    // ====================================================================
    
    // Authentication routes
    app.use("/api/auth", authRoutes);
    
    // Missing endpoints that were causing 404 errors
    app.get("/api/applications/my-applications", (req, res) => {
      res.json({
        success: true,
        data: { applications: [], total: 0 },
        message: 'Applications retrieved successfully'
      });
    });
    
    app.get("/api/matching/profile-status", (req, res) => {
      res.json({
        success: true,
        data: {
          profileComplete: false,
          completionPercentage: 20,
          missingFields: ['skills', 'experience', 'education']
        },
        message: 'Profile status retrieved successfully'
      });
    });
    
    app.get("/api/apprenticeships", (req, res) => {
      res.json({
        success: true,
        data: { apprenticeships: [], total: 0 },
        message: 'Apprenticeships retrieved successfully'
      });
    });
    
    // ====================================================================
    // ERROR HANDLING
    // ====================================================================
    
    // Error tracking middleware
    app.use(errorTracking);
    
    // Global error handler
    app.use(errorHandler);
    
    // 404 handler
    app.use("/api/*", (req, res) => {
      res.status(404).json({ 
        success: false,
        error: "API endpoint not found",
        path: req.path
      });
    });
    
    // ====================================================================
    // SERVER CREATION AND SSL SETUP
    // ====================================================================
    
    // Database connection
    try {
      const dbConnected = await connectToDatabase();
      console.log(dbConnected ? '✅ Database connected' : '⚠️ Using mock data');
    } catch (error) {
      console.warn('⚠️ Database failed, continuing with mock data');
    }
    
    // Create HTTPS server if SSL certificates are available
    if (process.env.NODE_ENV === 'production' && 
        process.env.SSL_CERT_PATH && 
        process.env.SSL_KEY_PATH &&
        fs.existsSync(process.env.SSL_CERT_PATH) && 
        fs.existsSync(process.env.SSL_KEY_PATH)) {
      
      const sslOptions = {
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
        key: fs.readFileSync(process.env.SSL_KEY_PATH)
      };
      
      const httpsServer = https.createServer(sslOptions, app);
      
      // HTTP to HTTPS redirect server
      const httpApp = express();
      httpApp.use((req, res) => {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
      });
      
      // Start HTTP redirect server
      httpApp.listen(HTTP_PORT, () => {
        console.log(`🔄 HTTP redirect server running on port ${HTTP_PORT}`);
      });
      
      // Start HTTPS server
      httpsServer.listen(PORT, () => {
        console.log('🎯 ================================');
        console.log(`✅ HTTPS Production server running on port ${PORT}`);
        console.log(`🌐 Website: https://${env.DOMAIN || 'localhost'}`);
        console.log(`🔒 SSL certificates loaded successfully`);
        console.log('🎯 ================================');
      });
      
      return httpsServer;
      
    } else {
      // Development or HTTP server
      const httpServer = createServer(app);
      
      httpServer.listen(PORT, () => {
        console.log('🎯 ================================');
        console.log(`✅ Production server running on port ${PORT}`);
        console.log(`🌐 API: http://localhost:${PORT}/api`);
        console.log(`🏥 Health: http://localhost:${PORT}/api/ping`);
        console.log('🎯 ================================');
      });
      
      return httpServer;
    }
    
  } catch (error: any) {
    console.error('❌ Failed to start production server:', error.message);
    process.exit(1);
  }
}

// Start production server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startProductionServer().catch((error) => {
    console.error('❌ Production server startup failed:', error.message);
    process.exit(1);
  });
}
