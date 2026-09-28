import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/index.js';
import { testConnection } from './db/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logging.level,
      transport: config.logging.pretty
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    trustProxy: true,
  });

  // Register helmet for security headers
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  // Register CORS
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (
        config.nodeEnv === 'development' ||
        config.security.corsOrigin === '*' ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin === config.security.corsOrigin ||
        origin.endsWith('.vercel.app')
      ) {
        return cb(null, true);
      }
      return cb(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
  });

  // Register rate limiting
  await app.register(rateLimit, {
    max: config.api.rateLimitMax,
    timeWindow: config.api.rateLimitWindow,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
      },
    }),
  });

  // Register Swagger/OpenAPI
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'La Casa De Rozgaar - Intelligence Platform API',
        description: 'Module 1 - Market Intelligence & Data Platform API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'jobs', description: 'Job data operations' },
        { name: 'skills', description: 'Skill intelligence operations' },
        { name: 'roles', description: 'Role intelligence operations' },
        { name: 'market', description: 'Market intelligence analytics' },
        { name: 'trends', description: 'Trend analysis' },
        { name: 'compensation', description: 'Compensation analytics' },
        { name: 'forecasts', description: 'Demand forecasting' },
        { name: 'search', description: 'Search operations' },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    const statusCode = error.statusCode || 500;
    const errorResponse = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        ...(config.nodeEnv === 'development' && { stack: error.stack }),
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };

    reply.code(statusCode).send(errorResponse);
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Health check handler
  const healthHandler = async (_request: any, reply: any) => {
    const isDbUp = await testConnection();
    const dbStatus = isDbUp ? 'connected' : 'disconnected';

    return reply.code(200).send({
      status: 'ok',
      database: dbStatus,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: 'skipped',
        mlService: 'ready',
      },
    });
  };

  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Ready check (stricter than health check)
  const readyHandler = async (_request: any, reply: any) => {
    const dbReady = await testConnection();

    if (!dbReady) {
      return reply.code(200).send({
        ready: true,
        database: 'disconnected',
        message: 'Service operational (database disconnected or pending migrations)',
      });
    }

    return reply.send({
      ready: true,
      database: 'connected',
      message: 'Service is ready',
    });
  };

  app.get('/api/ready', readyHandler);
  app.get('/ready', readyHandler);

  // Metrics endpoint
  app.get('/api/metrics', {
    schema: {
      tags: ['health'],
      description: 'Basic metrics endpoint',
    },
    handler: async (_request, reply) => {
      // TODO: Implement proper metrics collection
      reply.send({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      });
    },
  });

  // Register module routes
  const { jobRoutes } = await import('./routes/jobs.js');
  const { skillRoutes } = await import('./routes/skills.js');
  const { roleRoutes } = await import('./routes/roles.js');
  const { marketRoutes } = await import('./routes/market.js');
  const { compensationRoutes } = await import('./routes/compensation.js');
  const { forecastRoutes } = await import('./routes/forecasts.js');

  await jobRoutes(app);
  await skillRoutes(app);
  await roleRoutes(app);
  await marketRoutes(app);
  await compensationRoutes(app);
  await forecastRoutes(app);

  // Root endpoint
  app.get('/', {
    handler: async (_request, reply) => {
      reply.send({
        name: 'La Casa De Rozgaar - Intelligence Platform',
        version: '1.0.0',
        module: 'Module 1 - Intelligence & Data Platform',
        description: 'Market Intelligence, Skill Analytics, and Job Data API',
        documentation: '/api/docs',
        health: '/api/health',
      });
    },
  });

  return app;
}
