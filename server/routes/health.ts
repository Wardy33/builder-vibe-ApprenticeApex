import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { database } from '../middleware/database-neon';
import { getEnvConfig } from '../config/env';

const router = express.Router();

// Enhanced Database Health Check for Neon
router.get('/database', asyncHandler(async (req, res) => {
  console.log('🏥 Running Neon database health check...');

  try {
    const startTime = Date.now();

    // Basic connection status
    const isConnected = database.isConnected();
    const dbStatus = database.getHealthStatus();

    // Environment configuration
    const env = getEnvConfig();

    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: isConnected ? 'healthy' : 'unhealthy',
      checks: {
        connection: {
          connected: isConnected,
          status: dbStatus.status,
          database: 'neon',
          projectId: dbStatus.projectId,
          lastConnectedAt: dbStatus.lastConnectedAt,
          connectionAttempts: dbStatus.connectionAttempts
        },
        environment: {
          databaseUrl: env.DATABASE_URL ? 'configured' : 'missing',
          neonProjectId: env.NEON_PROJECT_ID ? 'configured' : 'missing',
          nodeEnv: env.NODE_ENV
        }
      },
      recommendations: []
    };

    // Add recommendations based on health status
    if (!isConnected) {
      healthCheck.recommendations.push('Neon database connection is not established');
    }

    if (!env.DATABASE_URL) {
      healthCheck.recommendations.push('DATABASE_URL environment variable not configured');
    }

    if (!env.NEON_PROJECT_ID) {
      healthCheck.recommendations.push('NEON_PROJECT_ID environment variable not configured');
    }

    const totalTime = Date.now() - startTime;
    healthCheck.checks.healthCheckDuration = `${totalTime}ms`;

    console.log(`✅ Neon database health check completed: ${healthCheck.status} (${totalTime}ms)`);

    sendSuccess(res, {
      health: healthCheck
    });

  } catch (error) {
    console.error('❌ Neon database health check failed:', error);
    sendError(res, 'Database health check failed', 500, 'HEALTH_CHECK_ERROR');
  }
}));

// Database Connection Test
router.get('/database/connection', asyncHandler(async (req, res) => {
  console.log('🔗 Testing database connection details...');
  
  try {
    const connection = database.getConnection();
    const isConnected = database.isConnected();
    
    if (!isConnected || !connection) {
      return sendError(res, 'Database not connected', 503, 'DB_NOT_CONNECTED');
    }

    const connectionInfo = {
      timestamp: new Date().toISOString(),
      connection: {
        host: connection.host,
        port: connection.port,
        name: connection.name,
        readyState: connection.readyState,
        readyStateDescription: getReadyStateDescription(connection.readyState),
        models: Object.keys(connection.models),
        collections: Object.keys(connection.collections)
      },
      server: {
        version: await connection.db.admin().serverStatus().then(status => status.version).catch(() => 'unknown'),
        uptime: await connection.db.admin().serverStatus().then(status => status.uptime).catch(() => 0)
      }
    };

    sendSuccess(res, {
      connectionInfo
    });

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    sendError(res, 'Connection test failed', 500, 'CONNECTION_TEST_ERROR');
  }
}));

// Database Collections Info
router.get('/database/collections', asyncHandler(async (req, res) => {
  console.log('��� Getting database collections information...');
  
  try {
    const connection = database.getConnection();
    if (!connection) {
      return sendError(res, 'Database connection not available', 503, 'DB_CONNECTION_ERROR');
    }

    const collections = await connection.db.listCollections().toArray();
    const collectionsInfo = {
      timestamp: new Date().toISOString(),
      database: connection.name,
      totalCollections: collections.length,
      collections: []
    };

    for (const collection of collections) {
      try {
        const stats = await connection.db.collection(collection.name).stats();
        const indexes = await connection.db.collection(collection.name).indexes();
        
        collectionsInfo.collections.push({
          name: collection.name,
          type: collection.type,
          documents: stats.count || 0,
          size: stats.size || 0,
          indexes: indexes.length,
          indexNames: indexes.map((idx: any) => idx.name)
        });
      } catch (error) {
        collectionsInfo.collections.push({
          name: collection.name,
          type: collection.type,
          error: 'Could not retrieve stats'
        });
      }
    }

    sendSuccess(res, {
      collectionsInfo
    });

  } catch (error) {
    console.error('❌ Collections info failed:', error);
    sendError(res, 'Failed to get collections info', 500, 'COLLECTIONS_INFO_ERROR');
  }
}));

// Database Performance Metrics
router.get('/database/performance', asyncHandler(async (req, res) => {
  console.log('��� Getting database performance metrics...');
  
  try {
    const performanceMonitor = databaseMiddleware.monitor;
    const healthStatus = performanceMonitor.getHealthStatus();
    const loggerStats = databaseMiddleware.logger.getStats();
    
    const performanceMetrics = {
      timestamp: new Date().toISOString(),
      status: healthStatus.status,
      metrics: {
        uptime: healthStatus.uptime,
        database: healthStatus.database,
        memory: healthStatus.memory,
        operations: {
          ...loggerStats,
          collectionsStats: loggerStats.collections
        }
      },
      alerts: []
    };

    // Add performance alerts
    if (healthStatus.database.queries.averageTime > 500) {
      performanceMetrics.alerts.push({
        level: 'warning',
        message: `Average query time is high: ${healthStatus.database.queries.averageTime}ms`
      });
    }
    
    if (healthStatus.database.queries.successRate < 0.95) {
      performanceMetrics.alerts.push({
        level: 'error',
        message: `Query success rate is low: ${(healthStatus.database.queries.successRate * 100).toFixed(1)}%`
      });
    }
    
    if (healthStatus.memory.used > 1000) {
      performanceMetrics.alerts.push({
        level: 'info',
        message: `Memory usage is high: ${healthStatus.memory.used}MB`
      });
    }

    sendSuccess(res, {
      performance: performanceMetrics
    });

  } catch (error) {
    console.error('❌ Performance metrics failed:', error);
    sendError(res, 'Failed to get performance metrics', 500, 'PERFORMANCE_METRICS_ERROR');
  }
}));

// Simple connectivity test
router.get('/ping', asyncHandler(async (req, res) => {
  const isConnected = database.isConnected();
  
  sendSuccess(res, {
    message: 'Database ping',
    connected: isConnected,
    timestamp: new Date().toISOString()
  });
}));

// Helper function
function getReadyStateDescription(state: number): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state as keyof typeof states] || 'unknown';
}

export default router;
