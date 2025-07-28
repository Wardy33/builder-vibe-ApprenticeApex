import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional().transform(val => Number(val) || 3001).default('3001'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Database Configuration
  MONGODB_URI: z.string().default('mongodb+srv://wardy33:BeauWard1337@clusteraa.6ulacjf.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAA'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // Stripe Configuration (Required for production)
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Video Call Configuration
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN: z.string().optional(),

  // Email Configuration (Hostinger SMTP)
  SMTP_HOST: z.string().optional().default('smtp.hostinger.com'),
  SMTP_PORT: z.string().optional().transform(val => Number(val) || 465).default('465'),
  SMTP_SECURE: z.string().optional().transform(val => val === 'true').default('true'),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().optional().default('ApprenticeApex'),

  // Security Configuration
  RATE_LIMIT_WINDOW_MS: z.string().optional().transform(val => Number(val) || 900000).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().optional().transform(val => Number(val) || 100).default('100'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

export function validateEnv(): EnvConfig {
  try {
    console.log('🔍 DEBUG - Starting environment validation...');
    console.log('🔍 DEBUG - process.env.MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');

    envConfig = envSchema.parse(process.env);

    // Add debug line after parsing
    console.log('🔍 DEBUG ENV VALIDATION - MONGODB_URI:', envConfig.MONGODB_URI ? `Found: ${envConfig.MONGODB_URI.substring(0, 30)}...` : 'MISSING');

    // Production-specific validations
    if (envConfig.NODE_ENV === 'production') {
      if (!envConfig.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is required in production');
      }
      if (!envConfig.SMTP_USER || !envConfig.SMTP_PASSWORD || !envConfig.EMAIL_FROM) {
        throw new Error('SMTP configuration (SMTP_USER, SMTP_PASSWORD, EMAIL_FROM) is required in production');
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
    console.log('🔍 DEBUG - envConfig not found, calling validateEnv()');
    return validateEnv();
  }
  console.log('🔍 DEBUG - returning existing envConfig, MONGODB_URI:', envConfig.MONGODB_URI ? 'Found' : 'Missing');
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