import mongoose from 'mongoose';
import { z } from 'zod';
import { database } from '../config/database';

// Database operation logger
export class DatabaseLogger {
  private static instance: DatabaseLogger;
  private logs: IDatabaseLog[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  public static getInstance(): DatabaseLogger {
    if (!DatabaseLogger.instance) {
      DatabaseLogger.instance = new DatabaseLogger();
    }
    return DatabaseLogger.instance;
  }

  public log(operation: IDatabaseOperation): void {
    const log: IDatabaseLog = {
      ...operation,
      timestamp: new Date(),
      id: this.generateLogId()
    };

    this.logs.unshift(log);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(log);
    }

    // Log slow queries
    if (log.duration && log.duration > 1000) {
      console.warn('🐌 Slow database query detected:', {
        operation: log.operation,
        collection: log.collection,
        duration: `${log.duration}ms`,
        query: log.query
      });
    }

    // Log errors
    if (log.error) {
      console.error('❌ Database operation error:', {
        operation: log.operation,
        collection: log.collection,
        error: log.error,
        query: log.query
      });
    }
  }

  private logToConsole(log: IDatabaseLog): void {
    const emoji = log.error ? '❌' : log.duration && log.duration > 500 ? '⚠️' : '✅';
    const duration = log.duration ? ` (${log.duration}ms)` : '';
    console.log(`${emoji} DB ${log.operation} ${log.collection}${duration}`);
  }

  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  public getLogs(limit: number = 100): IDatabaseLog[] {
    return this.logs.slice(0, limit);
  }

  public getStats(): IDatabaseStats {
    const now = Date.now();
    const last24h = this.logs.filter(log => now - log.timestamp.getTime() < 24 * 60 * 60 * 1000);
    const lastHour = this.logs.filter(log => now - log.timestamp.getTime() < 60 * 60 * 1000);

    return {
      total24h: last24h.length,
      totalLastHour: lastHour.length,
      errors24h: last24h.filter(log => log.error).length,
      errorsLastHour: lastHour.filter(log => log.error).length,
      averageDuration: this.calculateAverageDuration(lastHour),
      slowQueries24h: last24h.filter(log => log.duration && log.duration > 1000).length,
      collections: this.getCollectionStats(last24h)
    };
  }

  private calculateAverageDuration(logs: IDatabaseLog[]): number {
    const logsWithDuration = logs.filter(log => log.duration);
    if (logsWithDuration.length === 0) return 0;
    
    const totalDuration = logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0);
    return Math.round(totalDuration / logsWithDuration.length);
  }

  private getCollectionStats(logs: IDatabaseLog[]): Record<string, number> {
    const stats: Record<string, number> = {};
    logs.forEach(log => {
      stats[log.collection] = (stats[log.collection] || 0) + 1;
    });
    return stats;
  }
}

// Database validation middleware
export class DatabaseValidator {
  private static schemas: Map<string, z.ZodSchema> = new Map();

  public static registerSchema(collection: string, schema: z.ZodSchema): void {
    this.schemas.set(collection, schema);
  }

  public static validateInput(collection: string, data: any): IValidationResult {
    const schema = this.schemas.get(collection);
    if (!schema) {
      return { isValid: true, data };
    }

    const result = schema.safeParse(data);
    if (result.success) {
      return { isValid: true, data: result.data };
    } else {
      return {
        isValid: false,
        errors: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
  }

  public static validateObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  public static sanitizeInput(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };

    // Remove potentially dangerous keys
    delete sanitized.__proto__;
    delete sanitized.constructor;
    delete sanitized.prototype;

    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeInput(sanitized[key]);
      }
    });

    return sanitized;
  }
}

// Database performance monitor
export class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor;
  private metrics: IPerformanceMetrics = {
    queries: {
      total: 0,
      successful: 0,
      failed: 0,
      averageTime: 0
    },
    connections: {
      active: 0,
      available: 0,
      created: 0,
      destroyed: 0
    },
    memory: {
      used: 0,
      buffers: 0,
      cached: 0
    }
  };

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor();
    }
    return DatabasePerformanceMonitor.instance;
  }

  private startMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 30000);
  }

  private updateMetrics(): void {
    const connection = database.getConnection();
    if (connection) {
      // Update connection metrics
      const db = connection.db;
      if (db && db.serverConfig) {
        // These would be actual pool metrics from MongoDB driver
        this.metrics.connections.active = (db.serverConfig as any)?.s?.pool?.totalConnectionCount || 0;
        this.metrics.connections.available = (db.serverConfig as any)?.s?.pool?.availableConnectionCount || 0;
      }
    }

    // Update memory metrics (would integrate with process.memoryUsage())
    const memUsage = process.memoryUsage();
    this.metrics.memory.used = memUsage.heapUsed;
    this.metrics.memory.buffers = memUsage.external;
  }

  public recordQuery(duration: number, success: boolean): void {
    this.metrics.queries.total++;
    if (success) {
      this.metrics.queries.successful++;
    } else {
      this.metrics.queries.failed++;
    }

    // Update rolling average
    this.metrics.queries.averageTime = 
      (this.metrics.queries.averageTime * (this.metrics.queries.total - 1) + duration) / 
      this.metrics.queries.total;
  }

  public getMetrics(): IPerformanceMetrics {
    return { ...this.metrics };
  }

  public getHealthStatus(): IHealthStatus {
    const isHealthy = database.isConnected() && 
                     this.metrics.connections.active > 0 &&
                     this.metrics.queries.failed / Math.max(this.metrics.queries.total, 1) < 0.1;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      database: {
        connected: database.isConnected(),
        connectionPool: {
          active: this.metrics.connections.active,
          available: this.metrics.connections.available
        },
        queries: {
          total: this.metrics.queries.total,
          successRate: this.metrics.queries.total > 0 ? 
            this.metrics.queries.successful / this.metrics.queries.total : 0,
          averageTime: this.metrics.queries.averageTime
        }
      },
      memory: {
        used: Math.round(this.metrics.memory.used / 1024 / 1024), // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) // MB
      }
    };
  }
}

// Mongoose middleware wrapper
export function createDatabaseMiddleware() {
  const logger = DatabaseLogger.getInstance();
  const monitor = DatabasePerformanceMonitor.getInstance();

  // Query logging middleware
  mongoose.plugin(function(schema: mongoose.Schema) {
    // Pre-hooks for timing
    schema.pre(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'save', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany'], function() {
      (this as any)._startTime = Date.now();
    });

    // Post-hooks for logging
    schema.post(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'save', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany'], function() {
      const duration = Date.now() - ((this as any)._startTime || Date.now());
      const operation = (this as any).op || 'unknown';
      const collection = (this as any).model?.collection?.name || 'unknown';

      logger.log({
        operation,
        collection,
        duration,
        query: this.getQuery ? this.getQuery() : undefined
      });

      monitor.recordQuery(duration, true);
    });

    // Error handling
    schema.post(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'save', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany'], function(error: any) {
      if (error) {
        const duration = Date.now() - ((this as any)._startTime || Date.now());
        const operation = (this as any).op || 'unknown';
        const collection = (this as any).model?.collection?.name || 'unknown';

        logger.log({
          operation,
          collection,
          duration,
          error: error.message,
          query: this.getQuery ? this.getQuery() : undefined
        });

        monitor.recordQuery(duration, false);
      }
    });
  });

  return {
    logger,
    monitor,
    validator: DatabaseValidator
  };
}

// Input validation middleware for Express routes
export function validateDatabaseInput(collection: string) {
  return (req: any, res: any, next: any) => {
    // Validate request body
    if (req.body && typeof req.body === 'object') {
      const sanitizedBody = DatabaseValidator.sanitizeInput(req.body);
      const validation = DatabaseValidator.validateInput(collection, sanitizedBody);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      req.body = validation.data;
    }

    // Validate ObjectId parameters
    Object.keys(req.params).forEach(param => {
      if (param.endsWith('Id') && !DatabaseValidator.validateObjectId(req.params[param])) {
        return res.status(400).json({
          success: false,
          error: `Invalid ${param} format`
        });
      }
    });

    next();
  };
}

// Database connection monitoring middleware
export function databaseHealthCheck() {
  return async (req: any, res: any, next: any) => {
    if (req.path === '/api/health/database') {
      const monitor = DatabasePerformanceMonitor.getInstance();
      const healthStatus = monitor.getHealthStatus();
      const dbStatus = database.getHealthStatus();

      return res.json({
        ...healthStatus,
        database: {
          ...healthStatus.database,
          ...dbStatus
        }
      });
    }

    // Check database connection for other routes
    if (!database.isConnected()) {
      // In development mode without MONGODB_URI, allow requests to proceed
      const env = process.env.MONGODB_URI;
      if (!env || env === '') {
        console.warn('⚠️  Running in development mode without database connection');
        return next(); // Allow request to proceed
      }

      return res.status(503).json({
        success: false,
        error: 'Database connection unavailable',
        code: 'DB_CONNECTION_ERROR'
      });
    }

    next();
  };
}

// Query optimization middleware
export function optimizeQueries() {
  return (req: any, res: any, next: any) => {
    // Add pagination defaults
    if (req.query.page) {
      req.query.page = Math.max(1, parseInt(req.query.page) || 1);
    }
    
    if (req.query.limit) {
      req.query.limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    } else {
      req.query.limit = 10;
    }

    // Add default sorting
    if (!req.query.sort) {
      req.query.sort = '-createdAt';
    }

    next();
  };
}

// Interfaces
export interface IDatabaseOperation {
  operation: string;
  collection: string;
  duration?: number;
  error?: string;
  query?: any;
}

export interface IDatabaseLog extends IDatabaseOperation {
  id: string;
  timestamp: Date;
}

export interface IDatabaseStats {
  total24h: number;
  totalLastHour: number;
  errors24h: number;
  errorsLastHour: number;
  averageDuration: number;
  slowQueries24h: number;
  collections: Record<string, number>;
}

export interface IValidationResult {
  isValid: boolean;
  data?: any;
  errors?: Array<{
    path: string;
    message: string;
    code: string;
  }>;
}

export interface IPerformanceMetrics {
  queries: {
    total: number;
    successful: number;
    failed: number;
    averageTime: number;
  };
  connections: {
    active: number;
    available: number;
    created: number;
    destroyed: number;
  };
  memory: {
    used: number;
    buffers: number;
    cached: number;
  };
}

export interface IHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  database: {
    connected: boolean;
    connectionPool: {
      active: number;
      available: number;
    };
    queries: {
      total: number;
      successRate: number;
      averageTime: number;
    };
  };
  memory: {
    used: number;
    total: number;
  };
}

// Initialize database middleware
export const databaseMiddleware = createDatabaseMiddleware();

// Register validation schemas for collections
DatabaseValidator.registerSchema('users', z.object({
  email: z.string().email(),
  role: z.enum(['student', 'company', 'admin']),
  profile: z.object({}).passthrough()
}).passthrough());

DatabaseValidator.registerSchema('apprenticeships', z.object({
  jobTitle: z.string().min(3).max(200),
  description: z.string().min(100).max(5000),
  industry: z.string().min(1).max(100),
  companyId: z.string().min(1)
}).passthrough());

DatabaseValidator.registerSchema('applications', z.object({
  userId: z.string().min(1),
  apprenticeshipId: z.string().min(1),
  companyId: z.string().min(1)
}).passthrough());

DatabaseValidator.registerSchema('payments', z.object({
  userId: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().length(3),
  description: z.string().min(1).max(500)
}).passthrough());

// Export everything
// Classes are already exported above
