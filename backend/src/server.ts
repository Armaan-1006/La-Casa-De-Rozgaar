import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { requestIdMiddleware, errorHandler } from './middleware/auth.js';
import { getDb, closeDb } from './database/connection.js';

// Route imports
import authRoutes from './routes/auth.js';
import candidatesRoutes from './routes/candidates.js';
import assessmentsRoutes from './routes/assessments.js';
import skillGapsRoutes from './routes/skillGaps.js';
import matchingRoutes from './routes/matching.js';
import simulationRoutes from './routes/simulation.js';
import learningRoutes from './routes/learning.js';
import interviewsRoutes from './routes/interviews.js';
import researchRoutes from './routes/research.js';
import recommendationsRoutes from './routes/recommendations.js';
import employerRoutes from './routes/employer.js';
import talentRoutes from './routes/talent.js';
import workforceRoutes from './routes/workforce.js';
import compensationRoutes from './routes/compensation.js';
import notificationsRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Allow Swagger UI
  }));

  // CORS
  app.use(cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.nodeEnv === 'development' ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin === config.cors.origin
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  }));

  // Rate limiter (skip in test environment)
  if (config.nodeEnv !== 'test' && process.env.NODE_ENV !== 'test') {
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } },
    });
    app.use(limiter);
  }

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request ID middleware
  app.use(requestIdMiddleware);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    try {
      const db = getDb();
      db.prepare('SELECT 1').get();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
        database: 'connected',
        intelligenceProvider: config.intelligenceProvider,
      });
    } catch (err: any) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err.message,
      });
    }
  });

  // API v1 routes
  const apiV1 = express.Router();

  apiV1.use('/auth', authRoutes);
  apiV1.use('/users', usersRoutes);
  apiV1.use('/candidates', candidatesRoutes);
  apiV1.use('/assessments', assessmentsRoutes);
  apiV1.use('/skill-gaps', skillGapsRoutes);
  apiV1.use('/matching', matchingRoutes);
  apiV1.use('/simulation', simulationRoutes);
  apiV1.use('/learning', learningRoutes);
  apiV1.use('/interviews', interviewsRoutes);
  apiV1.use('/research', researchRoutes);
  apiV1.use('/recommendations', recommendationsRoutes);
  apiV1.use('/organizations', employerRoutes);
  apiV1.use('/employer', employerRoutes);
  apiV1.use('/talent', talentRoutes);
  apiV1.use('/workforce', workforceRoutes);
  apiV1.use('/compensation', compensationRoutes);
  apiV1.use('/notifications', notificationsRoutes);

  app.use('/api/v1', apiV1);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
        requestId: (req as any).requestId,
      },
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

// Server startup
if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  const server = app.listen(config.port, config.host, () => {
    console.log(`=======================================================`);
    console.log(` LA CASA DE ROZGAAR - MODULE 2 BACKEND`);
    console.log(` User, Talent & Career Intelligence Engine`);
    console.log(`=======================================================`);
    console.log(` Server running on http://${config.host}:${config.port}`);
    console.log(` Health check:    http://${config.host}:${config.port}/health`);
    console.log(` API Base:        http://${config.host}:${config.port}/api/v1`);
    console.log(` Intelligence:    ${config.intelligenceProvider.toUpperCase()} mode`);
    console.log(` Database:        ${config.database.path}`);
    console.log(` Environment:     ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      closeDb();
      console.log('Database connection closed. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default createApp;
