import { FastifyInstance } from 'fastify';
import { SkillRepository } from '../db/skillRepository.js';
import { RoleRepository } from '../db/roleRepository.js';

export async function marketRoutes(app: FastifyInstance) {
  // GET /api/v1/market/skills/:id - Get market skill signal
  app.get<{ Params: { id: string } }>(
    '/api/v1/market/skills/:id',
    {
      schema: {
        tags: ['market'],
        description: 'Get market intelligence signal for a skill',
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

      const demandList = await SkillRepository.getDemandStats(id);
      const demand = demandList.length > 0 ? demandList[0] : null;

      // Build market signal
      const signal = {
        skillId: id,
        skillName: skill.canonicalName,
        demandScore: demand?.totalJobs || 0,
        trendDirection: demand?.trend || 'STABLE',
        growth30d: demand?.growthRate || 0,
        avgSalaryMin: 0,
        avgSalaryMax: 0,
        currency: 'INR',
        openings: demand?.totalJobs || 0,
        lastUpdated: (demand?.lastUpdated || new Date()).toISOString(),
      };

      return reply.send({
        success: true,
        data: signal,
      });
    }
  );

  // GET /api/v1/market/roles/:id - Get market role signal
  app.get<{ Params: { id: string } }>(
    '/api/v1/market/roles/:id',
    {
      schema: {
        tags: ['market'],
        description: 'Get market intelligence signal for a role',
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

      const demandList = await RoleRepository.getDemandStats(id);
      const demand = demandList.length > 0 ? demandList[0] : null;

      // Build market signal
      const signal = {
        roleId: id,
        roleName: role.canonicalName,
        demandScore: demand?.totalJobs || 0,
        trendDirection: demand?.trend || 'STABLE',
        growth30d: demand?.growthRate || 0,
        avgSalaryMin: 0,
        avgSalaryMax: 0,
        currency: 'INR',
        openings: demand?.totalJobs || 0,
        lastUpdated: (demand?.lastUpdated || new Date()).toISOString(),
      };

      return reply.send({
        success: true,
        data: signal,
      });
    }
  );
}
