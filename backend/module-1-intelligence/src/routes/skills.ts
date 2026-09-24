import { FastifyInstance } from 'fastify';
import { SkillRepository } from '../db/skillRepository.js';

interface SkillSearchQuery {
  q?: string;
  category?: string;
  page?: string;
  pageSize?: string;
}

export async function skillRoutes(app: FastifyInstance) {
  // GET /api/v1/skills/:id - Get skill by ID
  app.get<{ Params: { id: string } }>(
    '/api/v1/skills/:id',
    {
      schema: {
        tags: ['skills'],
        description: 'Get skill by ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const skill = await SkillRepository.findById(id);

      if (!skill) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'SKILL_NOT_FOUND',
            message: 'Skill not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: skill,
      });
    }
  );

  // GET /api/v1/skills - Search skills
  app.get<{ Querystring: SkillSearchQuery }>(
    '/api/v1/skills',
    {
      schema: {
        tags: ['skills'],
        description: 'Search skills with optional filters',
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Search query' },
            category: { type: 'string' },
            page: { type: 'string', default: '1' },
            pageSize: { type: 'string', default: '50' },
          },
        },
      },
    },
    async (request, reply) => {
      const { q, category, page = '1', pageSize = '50' } = request.query;

      const pageNum = parseInt(page, 10);
      const pageSizeNum = parseInt(pageSize, 10);

      const result = await SkillRepository.findAll({
        search: q,
        category,
        limit: pageSizeNum,
        offset: (pageNum - 1) * pageSizeNum,
      });

      return reply.send({
        success: true,
        data: result.skills,
        meta: {
          total: result.total,
          page: pageNum,
          pageSize: pageSizeNum,
        },
      });
    }
  );

  // GET /api/v1/skills/:id/demand - Get skill demand trend
  app.get<{ Params: { id: string } }>(
    '/api/v1/skills/:id/demand',
    {
      schema: {
        tags: ['skills'],
        description: 'Get skill demand analytics',
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const skill = await SkillRepository.findById(id);
      if (!skill) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'SKILL_NOT_FOUND',
            message: 'Skill not found',
          },
        });
      }

      const demand = await SkillRepository.getDemandStats(id);

      return reply.send({
        success: true,
        data: demand.length > 0 ? demand[0] : null,
      });
    }
  );
}
