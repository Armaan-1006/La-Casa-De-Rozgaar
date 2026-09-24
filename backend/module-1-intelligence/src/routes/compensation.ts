import { FastifyInstance } from 'fastify';
import { query } from '../db/index.js';

interface CompensationQuery {
  roleId?: string;
  location?: string;
  experienceYears?: string;
  skillIds?: string;
}

export async function compensationRoutes(app: FastifyInstance) {
  // GET /api/v1/compensation - Get compensation analytics
  app.get<{ Querystring: CompensationQuery }>(
    '/api/v1/compensation',
    {
      schema: {
        tags: ['compensation'],
        description: 'Get compensation data based on filters',
        querystring: {
          type: 'object',
          properties: {
            roleId: { type: 'string', format: 'uuid' },
            location: { type: 'string' },
            experienceYears: { type: 'string' },
            skillIds: { type: 'string', description: 'Comma-separated skill IDs' },
          },
        },
      },
    },
    async (request, reply) => {
      const { roleId, location, experienceYears } = request.query;

      const conditions: string[] = ['j.processing_status = $1'];
      const params: any[] = ['processed'];
      let paramIndex = 2;

      if (roleId) {
        conditions.push(`j.role_id = $${paramIndex}`);
        params.push(roleId);
        paramIndex++;
      }

      if (location) {
        conditions.push(`j.location ILIKE $${paramIndex}`);
        params.push(`%${location}%`);
        paramIndex++;
      }

      if (experienceYears) {
        const expNum = parseInt(experienceYears, 10);
        conditions.push(`j.experience_min <= $${paramIndex}`);
        params.push(expNum);
        paramIndex++;
        conditions.push(`(j.experience_max IS NULL OR j.experience_max >= $${paramIndex})`);
        params.push(expNum);
        paramIndex++;
      }

      const whereClause = conditions.join(' AND ');

      const queryText = `
        SELECT
          COUNT(*) as sample_size,
          AVG(j.salary_min) as avg_min,
          AVG(j.salary_max) as avg_max,
          PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY j.salary_min) as p25_min,
          PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY j.salary_min) as p50_min,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY j.salary_min) as p75_min,
          MIN(j.salary_min) as min_observed,
          MAX(j.salary_max) as max_observed,
          j.salary_currency as currency
        FROM jobs j
        WHERE ${whereClause}
          AND j.salary_min IS NOT NULL
          AND j.salary_max IS NOT NULL
        GROUP BY j.salary_currency
      `;

      const result = await query(queryText, params);

      if (result.rows.length === 0) {
        return reply.send({
          success: true,
          data: {
            sampleSize: 0,
            currency: 'INR',
            min: 0,
            max: 0,
            median: 0,
            p25: 0,
            p75: 0,
          },
        });
      }

      const row = result.rows[0];

      return reply.send({
        success: true,
        data: {
          sampleSize: parseInt(row.sample_size, 10),
          currency: row.currency || 'INR',
          min: parseFloat(row.min_observed) || 0,
          max: parseFloat(row.max_observed) || 0,
          median: parseFloat(row.p50_min) || 0,
          p25: parseFloat(row.p25_min) || 0,
          p75: parseFloat(row.p75_min) || 0,
          avgMin: parseFloat(row.avg_min) || 0,
          avgMax: parseFloat(row.avg_max) || 0,
        },
      });
    }
  );
}
