import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { database } from '../config/database';
import { databaseMiddleware } from '../middleware/database';
import { getEnvConfig } from '../config/env';

// Import schemas for connection testing
import { User } from '../schemas/User';
import { Apprenticeship } from '../schemas/Apprenticeship';

const router = express.Router();

// Enhanced Database Health Check
router.get('/database', asyncHandler(async (req, res) => {
  console.log('🏥 Running enhanced database health check...');
  
  try {
    const startTime = Date.now();
    
    // Basic connection status
    const isConnected = database.isConnected();
    const dbStatus = database.getHealthStatus();
    
    // Performance monitoring
    const performanceMonitor = databaseMiddleware.monitor;
    const performanceStatus = performanceMonitor.getHealthStatus();
    
    // Database logger stats
    const loggerStats = databaseMiddleware.logger.getStats();
    
    // Environment configuration
    const env = getEnvConfig();
    
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: isConnected ? 'healthy' : 'unhealthy',
      checks: {
        connection: {
          connected: isConnected,
          status: dbStatus.status,
          host: database.getConnection()?.host || 'unknown',
          database: database.getConnection()?.name || 'unknown',
          readyState: database.getConnection()?.readyState || 0,
          lastConnectedAt: dbStatus.lastConnectedAt,
          connectionAttempts: dbStatus.connectionAttempts
        },
        connectionPool: {
          poolSize: dbStatus.poolSize || 0,
          availableConnections: dbStatus.availableConnections || 0,
          utilization: dbStatus.poolSize ? 
            `${Math.round(((dbStatus.poolSize - dbStatus.availableConnections) / dbStatus.poolSize) * 100)}%` : '0%'
        },
        performance: {
          status: performanceStatus.status,
          uptime: performanceStatus.uptime,
          queries: performanceStatus.database.queries,
          memory: performanceStatus.memory
        },
        operations: {
          total24h: loggerStats.total24h,
          totalLastHour: loggerStats.totalLastHour,
          errors24h: loggerStats.errors24h,
          errorRate: loggerStats.total24h > 0 ? 
            `${((loggerStats.errors24h / loggerStats.total24h) * 100).toFixed(2)}%` : '0%',
          averageQueryTime: `${loggerStats.averageDuration}ms`,
          slowQueries24h: loggerStats.slowQueries24h
        },
        environment: {
          mongoUri: env.MONGODB_URI ? 'configured' : 'missing',
          ssl: env.MONGODB_URI?.includes('ssl=true') || false,
          nodeEnv: env.NODE_ENV
        }
      },
      recommendations: []
    };

    // Add recommendations based on health status
    if (!isConnected) {
      healthCheck.recommendations.push('Database connection is not established');
    }
    
    if (dbStatus.poolSize && dbStatus.availableConnections < 2) {
      healthCheck.recommendations.push('Connection pool utilization is high - consider increasing pool size');
    }
    
    if (loggerStats.slowQueries24h > 10) {
      healthCheck.recommendations.push(`${loggerStats.slowQueries24h} slow queries detected in last 24h - consider query optimization`);
    }
    
    if (loggerStats.errors24h / Math.max(loggerStats.total24h, 1) > 0.05) {
      healthCheck.recommendations.push('High error rate detected - investigate database operations');
    }

    // Test database responsiveness
    if (isConnected) {
      try {
        const pingStart = Date.now();
        await database.validateConnection();
        const pingTime = Date.now() - pingStart;
        
        healthCheck.checks.responsiveness = {
          pingTime: `${pingTime}ms`,
          status: pingTime < 100 ? 'excellent' : pingTime < 500 ? 'good' : 'slow'
        };
        
        if (pingTime > 1000) {
          healthCheck.recommendations.push('Database response time is slow (>1000ms)');
        }
      } catch (error) {
        healthCheck.checks.responsiveness = {
          status: 'failed',
          error: (error as Error).message
        };
        healthCheck.recommendations.push('Database ping test failed');
      }
    }

    const totalTime = Date.now() - startTime;
    healthCheck.checks.healthCheckDuration = `${totalTime}ms`;

    console.log(`✅ Database health check completed: ${healthCheck.status} (${totalTime}ms)`);

    sendSuccess(res, {
      health: healthCheck
    });

  } catch (error) {
    console.error('❌ Database health check failed:', error);
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
  console.log('📊 Getting database collections information...');
  
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
  console.log('📈 Getting database performance metrics...');
  
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
