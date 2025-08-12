import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Database configuration
export const databaseConfig = {
  url: env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
  },
};

// Redis configuration
export const redisConfig = {
  url: env.REDIS_URL,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// JWT configuration
export const jwtConfig = {
  secret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
};

// S3 configuration
export const s3Config = {
  bucket: env.S3_BUCKET,
  region: env.S3_REGION,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true, // For MinIO compatibility
};

// AI configuration
export const aiConfig = {
  openaiApiKey: env.OPENAI_API_KEY,
  defaultModel: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7,
};

// Server configuration
export const serverConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  corsOrigin: env.CORS_ORIGIN,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logLevel: env.LOG_LEVEL,
};

// Security configuration
export const securityConfig = {
  bcryptRounds: 12,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

// File upload configuration
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  uploadDir: 'uploads',
};

// WebSocket configuration
export const websocketConfig = {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6, // 1MB
};

// Collaboration configuration
export const collaborationConfig = {
  cursorUpdateInterval: 100, // ms
  sessionTimeout: 5 * 60 * 1000, // 5 minutes
  maxParticipants: 50,
  maxCursors: 100,
};

// Analytics configuration
export const analyticsConfig = {
  retentionDays: 90,
  batchSize: 1000,
  flushInterval: 5 * 60 * 1000, // 5 minutes
};

// Notification configuration
export const notificationConfig = {
  maxNotifications: 1000,
  cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
  emailNotifications: false, // TODO: Implement email service
};

// Export all configurations
export const config = {
  database: databaseConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  s3: s3Config,
  ai: aiConfig,
  server: serverConfig,
  security: securityConfig,
  upload: uploadConfig,
  websocket: websocketConfig,
  collaboration: collaborationConfig,
  analytics: analyticsConfig,
  notification: notificationConfig,
};

export default config; 