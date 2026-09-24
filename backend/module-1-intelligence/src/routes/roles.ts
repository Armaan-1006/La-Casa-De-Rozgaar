import { FastifyInstance } from 'fastify';
import { RoleRepository } from '../db/roleRepository.js';

interface RoleSearchQuery {
  q?: string;
  category?: string;
}

export async function roleRoutes(app: FastifyInstance) {
  // GET /api/v1/roles/:id - Get role by ID
  app.get<{ Params: { id: string } }>(
    '/api/v1/roles/:id',
    {
      schema: {
        tags: ['roles'],
        description: 'Get role by ID',
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
      const role = await RoleRepository.findById(id);

      if (!role) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'ROLE_NOT_FOUND',
            message: 'Role not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: role,
      });
    }
  );

  // GET /api/v1/roles - Search roles
  app.get<{ Querystring: RoleSearchQuery }>(
    '/api/v1/roles',
    {
      schema: {
        tags: ['roles'],
        description: 'Search roles',
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Search query' },
            category: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { q } = request.query;

      const result = await RoleRepository.findAll({
        search: q,
      });

      return reply.send({
        success: true,
        data: result.roles,
        meta: {
          total: result.total,
        },
      });
    }
  );

  // GET /api/v1/roles/:id/requirements - Get role skill requirements
  app.get<{ Params: { id: string } }>(
    '/api/v1/roles/:id/requirements',
    {
      schema: {
        tags: ['roles'],
        description: 'Get skill requirements for a role',
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const role = await RoleRepository.findById(id);
      if (!role) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'ROLE_NOT_FOUND',
            message: 'Role not found',
          },
        });
      }

      const requirements = await RoleRepository.getSkillRequirements(id);

      return reply.send({
        success: true,
        data: {
          roleId: id,
          roleName: role.canonicalName,
          requirements,
        },
      });
    }
  );
}
