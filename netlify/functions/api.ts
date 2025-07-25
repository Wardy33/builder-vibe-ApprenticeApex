import serverless from "serverless-http";
import express from "express";

// Force production environment
process.env.NODE_ENV = "production";

// Import after setting NODE_ENV
import { createServer } from "../../server";

const app = createServer();

// Serve static files for production
app.use(express.static('dist/spa'));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(require('path').join(process.cwd(), 'dist/spa', 'index.html'));
});

export const handler = serverless(app);
