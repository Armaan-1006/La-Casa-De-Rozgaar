import { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';

interface ForecastRequest {
  horizon: number;
  entities: Array<{ type: 'skill' | 'role'; id: string }>;
}

export async function forecastRoutes(app: FastifyInstance) {
  // POST /api/v1/forecasts - Generate demand forecast
  app.post<{ Body: ForecastRequest }>(
    '/api/v1/forecasts',
    {
      schema: {
        tags: ['forecasts'],
        description: 'Generate demand forecast for skills/roles',
        body: {
          type: 'object',
          required: ['horizon', 'entities'],
          properties: {
            horizon: {
              type: 'number',
              description: 'Forecast horizon in days',
              minimum: 1,
              maximum: 365,
            },
            entities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { enum: ['skill', 'role'] },
                  id: { type: 'string', format: 'uuid' },
                },
                required: ['type', 'id'],
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { horizon, entities } = request.body;

      if (!config.features.enableForecasting) {
        return reply.code(503).send({
          success: false,
          error: {
            code: 'FORECASTING_DISABLED',
            message: 'Forecasting feature is currently disabled',
          },
        });
      }

      // TODO: Implement actual forecasting logic with ML service
      // For now, return placeholder forecast
      const predictions = entities.map((entity) => ({
        entityType: entity.type,
        entityId: entity.id,
        forecast: [
          {
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            predictedDemand: 100,
            confidence: 0.75,
          },
          {
            date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            predictedDemand: 110,
            confidence: 0.70,
          },
          {
            date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            predictedDemand: 115,
            confidence: 0.65,
          },
        ],
      }));

      return reply.send({
        success: true,
        data: {
          horizon,
          predictions,
          generatedAt: new Date().toISOString(),
          modelVersion: 'v1.0-placeholder',
        },
      });
    }
  );
}
