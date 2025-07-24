import mongoose, { Connection } from 'mongoose';
import { getEnvConfig } from './env';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  lastError?: Error;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: Connection | null = null;
  private state: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    connectionAttempts: 0,
  };
  private retryTimer: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private gracefulShutdownHandlers: (() => Promise<void>)[] = [];

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    if (this.state.isConnected) {
      console.log('🗄️  Database already connected');
      return;
    }

    if (this.state.isConnecting) {
      console.log('🗄️  Database connection already in progress');
      return;
    }

    this.state.isConnecting = true;
    this.state.connectionAttempts++;

    try {
      const env = getEnvConfig();
      
      if (!env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is required');
      }

      console.log(`🗄️  Attempting database connection (attempt ${this.state.connectionAttempts})`);

      // Production-ready MongoDB options
      const mongoOptions = {
        // Connection Pool Configuration
        maxPoolSize: 10, // Maximum number of connections
        minPoolSize: 2,  // Minimum number of connections
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000, // 45 seconds
        connectTimeoutMS: 30000, // 30 seconds
        
        // Retry Configuration
        retryWrites: true,
        retryReads: true,
        maxIdleTimeMS: 300000, // 5 minutes
        
        // Write Concern
        w: 'majority' as const,
        wtimeoutMS: 10000,
        
        // Read Preference
        readPreference: 'primary' as const,
        
        // Authentication & Security
        authSource: 'admin',
        ssl: env.NODE_ENV === 'production',
        
        // Buffer Configuration
        bufferMaxEntries: 0, // Disable mongoose buffering in production
        bufferCommands: false,
        
        // Heartbeat
        heartbeatFrequencyMS: 10000, // 10 seconds
        
        // Connection Management
        compressors: ['zlib'],
      };

      // Connect to MongoDB
      await mongoose.connect(env.MONGODB_URI, mongoOptions);
      
      this.connection = mongoose.connection;
      this.setupConnectionEventHandlers();
      
      this.state.isConnected = true;
      this.state.isConnecting = false;
      this.state.lastConnectedAt = new Date();
      this.state.lastError = undefined;

      console.log('🗄️  MongoDB connection established successfully');
      console.log(`🗄️  Connected to database: ${this.connection.name}`);
      console.log(`🗄️  Connection pool size: ${mongoOptions.maxPoolSize}`);

      // Start health monitoring
      this.startHealthCheck();

    } catch (error) {
      this.state.isConnecting = false;
      this.state.lastError = error as Error;
      this.state.lastDisconnectedAt = new Date();

      console.error('❌ Database connection failed:', error);

      // Implement exponential backoff retry
      if (this.state.connectionAttempts < 5) {
        const backoffDelay = Math.min(1000 * Math.pow(2, this.state.connectionAttempts - 1), 30000);
        console.log(`🔄 Retrying connection in ${backoffDelay}ms...`);
        
        this.retryTimer = setTimeout(() => {
          this.connect();
        }, backoffDelay);
      } else {
        console.error('❌ Maximum connection attempts reached. Database connection failed permanently.');
        throw error;
      }
    }
  }

  private setupConnectionEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('connected', () => {
      console.log('🗄️  Mongoose connected to MongoDB');
      this.state.isConnected = true;
      this.state.lastConnectedAt = new Date();
    });

    this.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      this.state.lastError = error;
    });

    this.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      this.state.isConnected = false;
      this.state.lastDisconnectedAt = new Date();
      
      // Attempt reconnection after a brief delay
      if (!this.state.isConnecting) {
        setTimeout(() => this.connect(), 5000);
      }
    });

    this.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      this.state.isConnected = true;
      this.state.connectionAttempts = 0; // Reset counter on successful reconnection
    });

    this.connection.on('close', () => {
      console.log('🗄️  MongoDB connection closed');
      this.state.isConnected = false;
    });

    // Handle process termination
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.gracefulShutdown().then(() => process.exit(1));
    });
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        if (this.connection && this.state.isConnected) {
          // Simple ping to check connection health
          await this.connection.db.admin().ping();
          
          // Check connection pool status
          const poolSize = this.connection.db.serverConfig?.s?.pool?.totalConnectionCount || 0;
          const availableConnections = this.connection.db.serverConfig?.s?.pool?.availableConnectionCount || 0;
          
          if (poolSize === 0) {
            console.warn('⚠️  No database connections in pool');
          }
          
          // Log pool status every 5 minutes
          if (Date.now() % (5 * 60 * 1000) < 30000) {
            console.log(`🗄️  DB Pool Status - Total: ${poolSize}, Available: ${availableConnections}`);
          }
        }
      } catch (error) {
        console.error('❌ Database health check failed:', error);
        this.state.lastError = error as Error;
      }
    }, 30000); // Check every 30 seconds
  }

  public async disconnect(): Promise<void> {
    console.log('🗄️  Initiating database disconnection...');
    
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
    }

    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.state.lastDisconnectedAt = new Date();
    
    console.log('🗄️  Database disconnected successfully');
  }

  public async gracefulShutdown(): Promise<void> {
    console.log('🛑 Initiating graceful database shutdown...');
    
    try {
      // Execute all registered shutdown handlers
      await Promise.all(this.gracefulShutdownHandlers.map(handler => handler()));
      
      // Close database connection
      await this.disconnect();
      
      console.log('✅ Graceful database shutdown completed');
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      throw error;
    }
  }

  public registerShutdownHandler(handler: () => Promise<void>): void {
    this.gracefulShutdownHandlers.push(handler);
  }

  public getConnectionState(): ConnectionState {
    return { ...this.state };
  }

  public getConnection(): Connection | null {
    return this.connection;
  }

  public isConnected(): boolean {
    return this.state.isConnected && this.connection?.readyState === 1;
  }

  public async validateConnection(): Promise<boolean> {
    try {
      if (!this.connection || !this.state.isConnected) {
        return false;
      }

      await this.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('Database validation failed:', error);
      return false;
    }
  }

  // Database operation helpers with retry logic
  public async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
        await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
      }
    }
    
    throw lastError;
  }

  // Health check endpoint data
  public getHealthStatus() {
    const state = this.getConnectionState();
    return {
      status: state.isConnected ? 'healthy' : 'unhealthy',
      connected: state.isConnected,
      connecting: state.isConnecting,
      connectionAttempts: state.connectionAttempts,
      lastConnectedAt: state.lastConnectedAt,
      lastDisconnectedAt: state.lastDisconnectedAt,
      lastError: state.lastError?.message,
      readyState: this.connection?.readyState,
      poolSize: this.connection?.db?.serverConfig?.s?.pool?.totalConnectionCount || 0,
      availableConnections: this.connection?.db?.serverConfig?.s?.pool?.availableConnectionCount || 0,
    };
  }
}

// Export singleton instance
export const database = DatabaseManager.getInstance();

// Convenience functions for backwards compatibility
export const connectDatabase = () => database.connect();
export const disconnectDatabase = () => database.disconnect();
export const isDbConnected = () => database.isConnected();
export const getDbConnection = () => database.getConnection();
export const validateDbConnection = () => database.validateConnection();
export const getDbHealthStatus = () => database.getHealthStatus();

// Export for advanced usage
export { DatabaseManager };
