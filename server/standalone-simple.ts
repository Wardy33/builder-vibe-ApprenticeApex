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

    // ====================================================================
    // PHASE 1: SERVER-LEVEL COMPREHENSIVE REQUEST DEBUGGING
    // ====================================================================
    app.use((req, res, next) => {
      console.log('\n🌐 === INCOMING REQUEST DEBUG ===');
      console.log('🔗 Method:', req.method);
      console.log('🔗 URL:', req.url);
      console.log('🔗 Path:', req.path);
      console.log('🔗 Headers:', JSON.stringify(req.headers, null, 2));
      console.log('🔗 Query:', JSON.stringify(req.query, null, 2));
      console.log('🔗 Content-Type:', req.get('Content-Type'));
      console.log('🔗 Content-Length:', req.get('Content-Length'));
      
      // Capture raw body for debugging
      let rawBody = '';
      req.on('data', (chunk) => {
        rawBody += chunk;
      });
      
      req.on('end', () => {
        console.log('🔗 Raw Body:', rawBody || '[EMPTY]');
        console.log('🔗 Parsed Body:', JSON.stringify(req.body, null, 2));
      });
      
      // Log response when it's sent
      const originalSend = res.send;
      res.send = function(data) {
        console.log('📤 Response Status:', res.statusCode);
        console.log('📤 Response Headers:', JSON.stringify(res.getHeaders(), null, 2));
        console.log('📤 Response Body:', data ? data.toString().substring(0, 500) : '[EMPTY]');
        console.log('🌐 === REQUEST COMPLETE ===\n');
        return originalSend.call(this, data);
      };
      
      next();
    });

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

    // ====================================================================
    // PHASE 2: ENHANCED EXPRESS CONFIGURATION WITH ERROR HANDLING
    // ====================================================================

    // 1. Enhanced JSON parsing with error handling
    app.use((req, res, next) => {
      console.log('🔧 Applying JSON middleware...');
      express.json({ 
        limit: "10mb",
        verify: (req, res, buf) => {
          try {
            JSON.parse(buf);
            console.log('✅ JSON validation passed');
          } catch (e) {
            console.error('❌ JSON parsing error:', e.message);
            console.error('❌ Raw body that failed:', buf.toString());
            throw new Error('Invalid JSON format');
          }
        }
      })(req, res, (err) => {
        if (err) {
          console.error('❌ Express JSON middleware error:', err.message);
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body',
            details: err.message
          });
        }
        console.log('✅ JSON middleware passed');
        next();
      });
    });

    // 2. Enhanced URL encoded parsing
    app.use((req, res, next) => {
      console.log('🔧 Applying URL encoded middleware...');
      express.urlencoded({ 
        extended: true, 
        limit: "10mb" 
      })(req, res, (err) => {
        if (err) {
          console.error('❌ Express URL encoded middleware error:', err.message);
          return res.status(400).json({
            success: false,
            error: 'Invalid URL encoded data',
            details: err.message
          });
        }
        console.log('✅ URL encoded middleware passed');
        next();
      });
    });

    // 3. Enhanced CORS handling with preflight support  
    app.use((req, res, next) => {
      console.log('🔧 Applying CORS middleware...');
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
      
      // Handle preflight requests
      if (req.method === "OPTIONS") {
        console.log('🔄 Handling CORS preflight for:', req.url);
        res.status(200).end();
        return;
      }
      
      console.log('✅ CORS middleware passed');
      next();
    });

    // 4. Content-Type validation for POST requests
    app.use('/api/auth/login', (req, res, next) => {
      if (req.method === 'POST') {
        const contentType = req.get('Content-Type');
        console.log('📋 Login request Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('❌ Invalid Content-Type for login:', contentType);
          return res.status(400).json({
            success: false,
            error: 'Content-Type must be application/json',
            received: contentType || 'none',
            required: 'application/json'
          });
        }
        console.log('✅ Content-Type validation passed');
      }
      next();
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
      console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
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
