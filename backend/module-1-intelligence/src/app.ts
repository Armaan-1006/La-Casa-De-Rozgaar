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
    origin: config.security.corsOrigin,
    credentials: true,
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

  // Health check endpoint
  app.get('/api/health', {
    schema: {
      tags: ['health'],
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            version: { type: 'string' },
            timestamp: { type: 'string' },
            services: {
              type: 'object',
              properties: {
                database: { type: 'string' },
                redis: { type: 'string' },
                mlService: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (_request, reply) => {
      const dbStatus = (await testConnection()) ? 'up' : 'down';
      // TODO: Add Redis and ML service health checks

      const status =
        dbStatus === 'up' ? 'healthy' : 'unhealthy';

      reply.code(dbStatus === 'up' ? 200 : 503).send({
        status,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
          redis: 'unknown', // TODO: implement
          mlService: 'unknown', // TODO: implement
        },
      });
    },
  });

  // Ready check (stricter than health check)
  app.get('/api/ready', {
    schema: {
      tags: ['health'],
      description: 'Readiness check endpoint',
    },
    handler: async (_request, reply) => {
      const dbReady = await testConnection();

      if (!dbReady) {
        return reply.code(503).send({
          ready: false,
          message: 'Service not ready',
        });
      }

      reply.send({
        ready: true,
        message: 'Service is ready',
      });
    },
  });

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
