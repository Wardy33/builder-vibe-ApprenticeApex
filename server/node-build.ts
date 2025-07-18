import path from "path";
import { createApp, connectDatabase, config } from "./index";
import express from "express";

async function startServer() {
  try {
    // Connect to database
    const dbConnected = await connectDatabase();

    if (!dbConnected && config.nodeEnv === "production") {
      console.error("Failed to connect to database in production");
      process.exit(1);
    }

    const { app, httpServer, io } = createApp();

    // In production, serve the built SPA files
    const __dirname = import.meta.dirname;
    const distPath = path.join(__dirname, "../spa");

    // Serve static files
    app.use(express.static(distPath));

    // Handle React Router - serve index.html for all non-API routes
    app.get("*", (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      res.sendFile(path.join(distPath, "index.html"));
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received, shutting down gracefully");
      httpServer.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("🛑 SIGINT received, shutting down gracefully");
      httpServer.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

    httpServer.listen(config.port, () => {
      console.log(`🚀 ApprenticeApex server running on port ${config.port}`);
      console.log(`📱 Frontend: http://localhost:${config.port}`);
      console.log(`🔧 API: http://localhost:${config.port}/api`);
      console.log(`🗨️ Socket.IO server initialized`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);

      if (config.nodeEnv === "development") {
        console.log(`📝 Mock data mode enabled`);
      }
    });

    // Log Socket.IO connection events
    io.on("connection", (socket) => {
      console.log(`🔗 Socket connected: ${socket.id}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
