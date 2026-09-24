import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration schema with validation
const configSchema = z.object({
  // Server
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  port: z.coerce.number().min(1).max(65535).default(3001),
  host: z.string().default('0.0.0.0'),

  // Database
  database: z.object({
    url: z.string().url(),
    host: z.string().default('localhost'),
    port: z.coerce.number().default(5432),
    name: z.string(),
    user: z.string(),
    password: z.string(),
    maxConnections: z.coerce.number().default(20),
    idleTimeout: z.coerce.number().default(30000),
  }),

  // Redis
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(6379),
    password: z.string().optional(),
    db: z.coerce.number().default(0),
  }),

  // API
  api: z.object({
    prefix: z.string().default('/api/v1'),
    rateLimitMax: z.coerce.number().default(100),
    rateLimitWindow: z.coerce.number().default(60000),
  }),

  // Security
  security: z.object({
    apiKeyIngestion: z.string().min(32),
    jwtSecret: z.string().min(32),
    corsOrigin: z.string(),
  }),

  // ML Service
  mlService: z.object({
    url: z.string().url(),
    timeout: z.coerce.number().default(30000),
  }),

  // Logging
  logging: z.object({
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    pretty: z.coerce.boolean().default(false),
  }),

  // Workers
  workers: z.object({
    concurrency: z.coerce.number().default(5),
    removeOnComplete: z.coerce.number().default(100),
    removeOnFail: z.coerce.number().default(1000),
  }),

  // Data Quality
  dataQuality: z.object({
    minConfidence: z.coerce.number().min(0).max(1).default(0.7),
    freshnessWarningDays: z.coerce.number().default(7),
    freshnessErrorDays: z.coerce.number().default(30),
  }),

  // Ingestion
  ingestion: z.object({
    batchSize: z.coerce.number().default(100),
    maxRetries: z.coerce.number().default(3),
  }),

  // Forecasting
  forecasting: z.object({
    horizonDays: z.coerce.number().default(90),
    minSampleSize: z.coerce.number().default(50),
  }),

  // Feature Flags
  features: z.object({
    enableMlExtraction: z.coerce.boolean().default(true),
    enableForecasting: z.coerce.boolean().default(true),
    enableTrendDetection: z.coerce.boolean().default(true),
  }),
});

// Parse and validate configuration
const rawConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  host: process.env.HOST,

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    maxConnections: process.env.DB_MAX_CONNECTIONS,
    idleTimeout: process.env.DB_IDLE_TIMEOUT,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB,
  },

  api: {
    prefix: process.env.API_PREFIX,
    rateLimitMax: process.env.API_RATE_LIMIT_MAX,
    rateLimitWindow: process.env.API_RATE_LIMIT_WINDOW,
  },

  security: {
    apiKeyIngestion: process.env.API_KEY_INGESTION,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN,
  },

  mlService: {
    url: process.env.ML_SERVICE_URL,
    timeout: process.env.ML_SERVICE_TIMEOUT,
  },

  logging: {
    level: process.env.LOG_LEVEL,
    pretty: process.env.LOG_PRETTY,
  },

  workers: {
    concurrency: process.env.WORKER_CONCURRENCY,
    removeOnComplete: process.env.WORKER_REMOVE_ON_COMPLETE,
    removeOnFail: process.env.WORKER_REMOVE_ON_FAIL,
  },

  dataQuality: {
    minConfidence: process.env.DATA_QUALITY_MIN_CONFIDENCE,
    freshnessWarningDays: process.env.DATA_FRESHNESS_WARNING_DAYS,
    freshnessErrorDays: process.env.DATA_FRESHNESS_ERROR_DAYS,
  },

  ingestion: {
    batchSize: process.env.INGESTION_BATCH_SIZE,
    maxRetries: process.env.INGESTION_MAX_RETRIES,
  },

  forecasting: {
    horizonDays: process.env.FORECAST_HORIZON_DAYS,
    minSampleSize: process.env.FORECAST_MIN_SAMPLE_SIZE,
  },

  features: {
    enableMlExtraction: process.env.ENABLE_ML_EXTRACTION,
    enableForecasting: process.env.ENABLE_FORECASTING,
    enableTrendDetection: process.env.ENABLE_TREND_DETECTION,
  },
};

// Validate and export
export const config = configSchema.parse(rawConfig);

// Helper to check if in production
export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';
export const isTest = config.nodeEnv === 'test';

export type Config = z.infer<typeof configSchema>;
