import { query, transaction } from '../db/index.js';
import type { Job, JobSkill } from '../types/index.js';

export class JobRepository {
  // Create a new job record
  static async create(jobData: Partial<Job>): Promise<Job> {
    const text = `
      INSERT INTO jobs (
        source, external_id, title, normalized_role, role_id, description,
        company_name, industry, location, country, state, city,
        is_remote, is_hybrid, is_onsite, employment_type,
        salary_min, salary_max, salary_currency, salary_period,
        experience_min, experience_max, seniority_level, education,
        posted_at, expires_at, source_url, processing_status,
        extraction_confidence, is_duplicate, duplicate_of
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29, $30, $31
      )
      RETURNING *
    `;

    const values = [
      jobData.source,
      jobData.externalId,
      jobData.title,
      jobData.normalizedRole,
      jobData.roleId,
      jobData.description,
      jobData.companyName,
      jobData.industry,
      jobData.location,
      jobData.country,
      jobData.state,
      jobData.city,
      jobData.isRemote ?? false,
      jobData.isHybrid ?? false,
      jobData.isOnsite ?? false,
      jobData.employmentType,
      jobData.salaryMin,
      jobData.salaryMax,
      jobData.salaryCurrency ?? 'INR',
      jobData.salaryPeriod,
      jobData.experienceMin,
      jobData.experienceMax,
      jobData.seniorityLevel,
      jobData.education ? JSON.stringify(jobData.education) : null,
      jobData.postedAt,
      jobData.expiresAt,
      jobData.sourceUrl,
      jobData.processingStatus ?? 'pending',
      jobData.extractionConfidence,
      jobData.isDuplicate ?? false,
      jobData.duplicateOf,
    ];

    const result = await query(text, values);
    return this.mapFromDb(result.rows[0]);
  }

  // Find job by ID
  static async findById(id: string): Promise<Job | null> {
    const text = 'SELECT * FROM jobs WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0] ? this.mapFromDb(result.rows[0]) : null;
  }

  // Find job by source and external ID
  static async findBySourceAndExternalId(
    source: string,
    externalId: string
  ): Promise<Job | null> {
    const text = 'SELECT * FROM jobs WHERE source = $1 AND external_id = $2';
    const result = await query(text, [source, externalId]);
    return result.rows[0] ? this.mapFromDb(result.rows[0]) : null;
  }

  // Find duplicates based on title, company, and location
  static async findPotentialDuplicates(
    title: string,
    companyName?: string,
    location?: string
  ): Promise<Job[]> {
    let text = `
      SELECT * FROM jobs
      WHERE is_duplicate = false
      AND similarity(title, $1) > 0.6
    `;
    const params: any[] = [title];

    if (companyName) {
      params.push(companyName);
      text += ` AND similarity(company_name, $${params.length}) > 0.6`;
    }

    if (location) {
      params.push(location);
      text += ` AND similarity(location, $${params.length}) > 0.6`;
    }

    text += ' LIMIT 5';

    const result = await query(text, params);
    return result.rows.map(this.mapFromDb);
  }

  // Update job
  static async update(id: string, updates: Partial<Job>): Promise<Job | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        const dbKey = this.camelToSnake(key);
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(key === 'education' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const text = `
      UPDATE jobs
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows[0] ? this.mapFromDb(result.rows[0]) : null;
  }

  // Search jobs with filters
  static async search(
    filters: {
      query?: string;
      roleId?: string;
      skillIds?: string[];
      location?: string;
      isRemote?: boolean;
      experienceMin?: number;
      experienceMax?: number;
      salaryMin?: number;
      salaryMax?: number;
      employmentType?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ jobs: Job[]; total: number }> {
    let whereConditions: string[] = ['is_duplicate = false'];
    const params: any[] = [];
    let paramIndex = 1;

    // Full-text search on title/description
    if (filters.query) {
      whereConditions.push(`(
        title ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex} OR
        company_name ILIKE $${paramIndex}
      )`);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    // Role filter
    if (filters.roleId) {
      whereConditions.push(`role_id = $${paramIndex}`);
      params.push(filters.roleId);
      paramIndex++;
    }

    // Location filter
    if (filters.location) {
      whereConditions.push(`(
        location ILIKE $${paramIndex} OR
        city ILIKE $${paramIndex} OR
        state ILIKE $${paramIndex} OR
        country ILIKE $${paramIndex}
      )`);
      params.push(`%${filters.location}%`);
      paramIndex++;
    }

    // Remote filter
    if (filters.isRemote !== undefined) {
      whereConditions.push(`is_remote = $${paramIndex}`);
      params.push(filters.isRemote);
      paramIndex++;
    }

    // Experience filters
    if (filters.experienceMin !== undefined) {
      whereConditions.push(`experience_max >= $${paramIndex}`);
      params.push(filters.experienceMin);
      paramIndex++;
    }

    if (filters.experienceMax !== undefined) {
      whereConditions.push(`experience_min <= $${paramIndex}`);
      params.push(filters.experienceMax);
      paramIndex++;
    }

    // Salary filters
    if (filters.salaryMin !== undefined) {
      whereConditions.push(`salary_max >= $${paramIndex}`);
      params.push(filters.salaryMin);
      paramIndex++;
    }

    if (filters.salaryMax !== undefined) {
      whereConditions.push(`salary_min <= $${paramIndex}`);
      params.push(filters.salaryMax);
      paramIndex++;
    }

    // Skill filters (requires join with job_skills)
    let joinClause = '';
    if (filters.skillIds && filters.skillIds.length > 0) {
      joinClause = `
        INNER JOIN job_skills js ON js.job_id = jobs.id
        WHERE js.skill_id = ANY($${paramIndex})
      `;
      params.push(filters.skillIds);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Count query
    const countText = `
      SELECT COUNT(DISTINCT jobs.id) as total
      FROM jobs
      ${joinClause}
      ${whereClause}
    `;

    // Data query
    const limit = filters.limit || 25;
    const offset = filters.offset || 0;

    const dataText = `
      SELECT DISTINCT jobs.*
      FROM jobs
      ${joinClause}
      ${whereClause}
      ORDER BY jobs.posted_at DESC NULLS LAST, jobs.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      query(countText, params.slice(0, paramIndex - 1)),
      query(dataText, params),
    ]);

    return {
      jobs: dataResult.rows.map(this.mapFromDb),
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  // Associate skills with job
  static async addSkills(
    jobId: string,
    skills: Array<{ skillId: string; isRequired?: boolean; confidence?: number; source?: 'extraction' | 'manual' | 'inferred' }>
  ): Promise<void> {
    if (skills.length === 0) return;

    await transaction(async (client) => {
      for (const skill of skills) {
        await client.query(
          `
          INSERT INTO job_skills (job_id, skill_id, is_required, confidence, source)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (job_id, skill_id)
          DO UPDATE SET
            is_required = EXCLUDED.is_required,
            confidence = EXCLUDED.confidence,
            source = EXCLUDED.source
          `,
          [
            jobId,
            skill.skillId,
            skill.isRequired ?? true,
            skill.confidence ?? 1.0,
            skill.source ?? 'extraction',
          ]
        );
      }
    });
  }

  // Get job skills
  static async getSkills(jobId: string): Promise<JobSkill[]> {
    const text = `
      SELECT js.*, s.canonical_name, s.category
      FROM job_skills js
      INNER JOIN skills s ON s.id = js.skill_id
      WHERE js.job_id = $1
    `;
    const result = await query(text, [jobId]);
    return result.rows.map((row) => ({
      jobId: row.job_id,
      skillId: row.skill_id,
      isRequired: row.is_required,
      confidence: parseFloat(row.confidence),
      source: row.source,
      canonicalName: row.canonical_name,
      category: row.category,
    }));
  }

  // Store raw payload
  static async storeRawPayload(jobId: string, rawPayload: unknown): Promise<void> {
    const text = `
      INSERT INTO raw_jobs (job_id, raw_payload)
      VALUES ($1, $2)
    `;
    await query(text, [jobId, JSON.stringify(rawPayload)]);
  }

  // Helper to map DB row to Job entity
  private static mapFromDb(row: any): Job {
    return {
      id: row.id,
      source: row.source,
      externalId: row.external_id,
      canonicalJobId: row.canonical_job_id,
      title: row.title,
      normalizedRole: row.normalized_role,
      roleId: row.role_id,
      description: row.description,
      companyName: row.company_name,
      industry: row.industry,
      location: row.location,
      country: row.country,
      state: row.state,
      city: row.city,
      isRemote: row.is_remote,
      isHybrid: row.is_hybrid,
      isOnsite: row.is_onsite,
      employmentType: row.employment_type,
      salaryMin: row.salary_min ? parseFloat(row.salary_min) : undefined,
      salaryMax: row.salary_max ? parseFloat(row.salary_max) : undefined,
      salaryCurrency: row.salary_currency,
      salaryPeriod: row.salary_period,
      experienceMin: row.experience_min,
      experienceMax: row.experience_max,
      seniorityLevel: row.seniority_level,
      education: row.education,
      postedAt: row.posted_at ? new Date(row.posted_at) : undefined,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      sourceUrl: row.source_url,
      processingStatus: row.processing_status,
      extractionConfidence: row.extraction_confidence ? parseFloat(row.extraction_confidence) : undefined,
      isDuplicate: row.is_duplicate,
      duplicateOf: row.duplicate_of,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
