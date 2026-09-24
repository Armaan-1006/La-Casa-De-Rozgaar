import { FastifyInstance } from 'fastify';
import { JobRepository } from '../db/jobRepository.js';

interface JobSearchQuery {
  keywords?: string;
  skills?: string;
  location?: string;
  page?: string;
  pageSize?: string;
}

export async function jobRoutes(app: FastifyInstance) {
  // GET /api/v1/jobs/:id - Get job by ID
  app.get<{ Params: { id: string } }>(
    '/api/v1/jobs/:id',
    {
      schema: {
        tags: ['jobs'],
        description: 'Get job by ID',
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
      const job = await JobRepository.findById(id);

      if (!job) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'JOB_NOT_FOUND',
            message: 'Job not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: job,
      });
    }
  );

  // GET /api/v1/jobs - Search jobs
  app.get<{ Querystring: JobSearchQuery }>(
    '/api/v1/jobs',
    {
      schema: {
        tags: ['jobs'],
        description: 'Search jobs with filters',
        querystring: {
          type: 'object',
          properties: {
            keywords: { type: 'string' },
            skills: { type: 'string', description: 'Comma-separated skill names' },
            location: { type: 'string' },
            page: { type: 'string', default: '1' },
            pageSize: { type: 'string', default: '25' },
          },
        },
      },
    },
    async (request, reply) => {
      const { keywords, location, page = '1', pageSize = '25' } = request.query;

      const pageNum = parseInt(page, 10);
      const pageSizeNum = parseInt(pageSize, 10);

      const filters = {
        query: keywords,
        skillIds: undefined, // TODO: Map skill names to IDs if needed
        location,
        limit: pageSizeNum,
        offset: (pageNum - 1) * pageSizeNum,
      };

      const result = await JobRepository.search(filters);

      return reply.send({
        success: true,
        data: {
          jobs: result.jobs,
          total: result.total,
          page: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(result.total / pageSizeNum),
        },
      });
    }
  );

  // POST /api/v1/jobs - Ingest new job (requires API key)
  app.post<{ Body: any }>(
    '/api/v1/jobs',
    {
      schema: {
        tags: ['jobs'],
        description: 'Ingest new job posting',
        security: [{ apiKey: [] }],
      },
    },
    async (request, reply) => {
      // TODO: Add API key validation middleware
      const jobData = request.body as Record<string, unknown>;

      try {
        const job = await JobRepository.create(jobData as any);
        return reply.code(201).send({
          success: true,
          data: job,
        });
      } catch (error: any) {
        request.log.error(error);
        return reply.code(400).send({
          success: false,
          error: {
            code: 'JOB_CREATION_FAILED',
            message: error.message,
          },
        });
      }
    }
  );
}
