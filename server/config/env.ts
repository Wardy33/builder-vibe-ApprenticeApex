import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Database Configuration
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // Stripe Configuration (Required for production)
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Video Call Configuration
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN_NAME: z.string().optional(),

  // Email Configuration
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Security Configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

export function validateEnv(): EnvConfig {
  try {
    envConfig = envSchema.parse(process.env);
    
    // Production-specific validations
    if (envConfig.NODE_ENV === 'production') {
      if (!envConfig.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is required in production');
      }
      if (!envConfig.EMAIL_USER || !envConfig.EMAIL_PASSWORD) {
        throw new Error('Email configuration is required in production');
      }
      if (!envConfig.DAILY_API_KEY) {
        console.warn('⚠️  DAILY_API_KEY not configured - video calls will use mock implementation');
      }
    }

    console.log('✅ Environment variables validated successfully');
    return envConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Environment validation failed:', error);
    }
    process.exit(1);
  }
}

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return envConfig;
}

// Runtime validation helper for critical operations
export function requireEnvVar(key: keyof EnvConfig, operation: string): string {
  const value = envConfig[key];
  if (!value) {
    throw new Error(`${key} is required for ${operation}. Please configure this environment variable.`);
  }
  return String(value);
}
