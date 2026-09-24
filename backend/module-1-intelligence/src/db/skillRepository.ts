import { query, transaction } from '../db/index.js';
import type { Skill, SkillAlias, SkillDemand, SkillRelationship } from '../types/index.js';

export class SkillRepository {
  // Create or get skill by canonical name
  static async findOrCreate(canonicalName: string, category?: string): Promise<Skill> {
    const existing = await this.findByCanonicalName(canonicalName);
    if (existing) return existing;

    const text = `
      INSERT INTO skills (canonical_name, category)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await query(text, [canonicalName, category]);
    return this.mapSkillFromDb(result.rows[0]);
  }

  // Find skill by ID
  static async findById(id: string): Promise<Skill | null> {
    const text = 'SELECT * FROM skills WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0] ? this.mapSkillFromDb(result.rows[0]) : null;
  }

  // Find skill by canonical name
  static async findByCanonicalName(name: string): Promise<Skill | null> {
    const text = 'SELECT * FROM skills WHERE LOWER(canonical_name) = LOWER($1)';
    const result = await query(text, [name]);
    return result.rows[0] ? this.mapSkillFromDb(result.rows[0]) : null;
  }

  // Find skill by alias
  static async findByAlias(alias: string): Promise<Skill | null> {
    const text = `
      SELECT s.*
      FROM skills s
      INNER JOIN skill_aliases sa ON sa.skill_id = s.id
      WHERE LOWER(sa.alias) = LOWER($1)
      LIMIT 1
    `;
    const result = await query(text, [alias]);
    return result.rows[0] ? this.mapSkillFromDb(result.rows[0]) : null;
  }

  // Add alias to skill
  static async addAlias(skillId: string, alias: string, confidence = 1.0): Promise<SkillAlias> {
    const text = `
      INSERT INTO skill_aliases (skill_id, alias, confidence)
      VALUES ($1, $2, $3)
      ON CONFLICT (skill_id, alias)
      DO UPDATE SET confidence = EXCLUDED.confidence
      RETURNING *
    `;
    const result = await query(text, [skillId, alias, confidence]);
    return this.mapAliasFromDb(result.rows[0]);
  }

  // Get all skills with optional filtering
  static async findAll(filters?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ skills: Skill[]; total: number }> {
    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(filters.category);
      paramIndex++;
    }

    if (filters?.search) {
      whereConditions.push(`canonical_name ILIKE $${paramIndex}`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const countText = `SELECT COUNT(*) as total FROM skills ${whereClause}`;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const dataText = `
      SELECT * FROM skills
      ${whereClause}
      ORDER BY canonical_name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      query(countText, params.slice(0, paramIndex - 1)),
      query(dataText, params),
    ]);

    return {
      skills: dataResult.rows.map(this.mapSkillFromDb),
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  // Get skill demand statistics
  static async getDemandStats(skillId?: string, limit = 20): Promise<SkillDemand[]> {
    let text = `
      SELECT
        s.id as skill_id,
        s.canonical_name,
        COUNT(DISTINCT js.job_id) as total_jobs,
        COALESCE(
          (
            SELECT ta.change_percent
            FROM trend_analysis ta
            WHERE ta.entity_type = 'skill' AND ta.entity_id = s.id
            ORDER BY ta.calculated_at DESC LIMIT 1
          ),
          0
        ) as growth_rate,
        COALESCE(
          (
            SELECT ta.status
            FROM trend_analysis ta
            WHERE ta.entity_type = 'skill' AND ta.entity_id = s.id
            ORDER BY ta.calculated_at DESC LIMIT 1
          ),
          'STABLE'
        ) as trend,
        MAX(js.created_at) as last_updated
      FROM skills s
      LEFT JOIN job_skills js ON js.skill_id = s.id
    `;

    const params: any[] = [];
    if (skillId) {
      text += ' WHERE s.id = $1';
      params.push(skillId);
    }

    text += `
      GROUP BY s.id, s.canonical_name
      ORDER BY total_jobs DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await query(text, params);
    return result.rows.map((row) => ({
      skillId: row.skill_id,
      canonicalName: row.canonical_name,
      totalJobs: parseInt(row.total_jobs, 10),
      growthRate: parseFloat(row.growth_rate) || 0,
      trend: row.trend,
      lastUpdated: new Date(row.last_updated || Date.now()),
    }));
  }

  // Get related skills based on co-occurrence
  static async getRelatedSkills(skillId: string, limit = 10): Promise<Array<Skill & { strength: number; cooccurrenceCount: number }>> {
    const text = `
      SELECT
        s.*,
        sr.strength,
        sr.cooccurrence_count
      FROM skill_relationships sr
      INNER JOIN skills s ON (
        (sr.skill_id_1 = $1 AND sr.skill_id_2 = s.id) OR
        (sr.skill_id_2 = $1 AND sr.skill_id_1 = s.id)
      )
      WHERE sr.relationship_type = 'related'
      ORDER BY sr.strength DESC
      LIMIT $2
    `;
    const result = await query(text, [skillId, limit]);
    return result.rows.map((row) => ({
      ...this.mapSkillFromDb(row),
      strength: parseFloat(row.strength),
      cooccurrenceCount: parseInt(row.cooccurrence_count, 10),
    }));
  }

  // Update skill co-occurrence relationships
  static async updateRelationships(): Promise<void> {
    // Calculate co-occurrences between skills in the same jobs
    const text = `
      INSERT INTO skill_relationships (skill_id_1, skill_id_2, relationship_type, cooccurrence_count, strength)
      SELECT
        LEAST(js1.skill_id, js2.skill_id) as skill_id_1,
        GREATEST(js1.skill_id, js2.skill_id) as skill_id_2,
        'related' as relationship_type,
        COUNT(*) as cooccurrence_count,
        ROUND(
          COUNT(*)::decimal / (
            SELECT COUNT(DISTINCT job_id) FROM job_skills WHERE skill_id IN (js1.skill_id, js2.skill_id)
          ),
          2
        ) as strength
      FROM job_skills js1
      INNER JOIN job_skills js2 ON js1.job_id = js2.job_id AND js1.skill_id < js2.skill_id
      GROUP BY LEAST(js1.skill_id, js2.skill_id), GREATEST(js1.skill_id, js2.skill_id)
      ON CONFLICT (skill_id_1, skill_id_2)
      DO UPDATE SET
        cooccurrence_count = EXCLUDED.cooccurrence_count,
        strength = EXCLUDED.strength,
        updated_at = NOW()
    `;
    await query(text);
  }

  // Map DB row to Skill
  private static mapSkillFromDb(row: any): Skill {
    return {
      id: row.id,
      canonicalName: row.canonical_name,
      category: row.category,
      parentSkillId: row.parent_skill_id,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  // Map DB row to SkillAlias
  private static mapAliasFromDb(row: any): SkillAlias {
    return {
      id: row.id,
      skillId: row.skill_id,
      alias: row.alias,
      confidence: parseFloat(row.confidence),
      createdAt: new Date(row.created_at),
    };
  }
}
