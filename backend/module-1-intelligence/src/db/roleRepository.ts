import { query } from '../db/index.js';
import type { Role, RoleSkillRequirement, RoleDemand } from '../types/index.js';

export class RoleRepository {
  // Create or get role by canonical name
  static async findOrCreate(
    canonicalName: string,
    roleFamily?: string,
    seniorityLevel?: string
  ): Promise<Role> {
    const existing = await this.findByCanonicalName(canonicalName);
    if (existing) return existing;

    const text = `
      INSERT INTO roles (canonical_name, role_family, seniority_level)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(text, [canonicalName, roleFamily, seniorityLevel]);
    return this.mapRoleFromDb(result.rows[0]);
  }

  // Find role by ID
  static async findById(id: string): Promise<Role | null> {
    const text = 'SELECT * FROM roles WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0] ? this.mapRoleFromDb(result.rows[0]) : null;
  }

  // Find role by canonical name
  static async findByCanonicalName(name: string): Promise<Role | null> {
    const text = 'SELECT * FROM roles WHERE LOWER(canonical_name) = LOWER($1)';
    const result = await query(text, [name]);
    return result.rows[0] ? this.mapRoleFromDb(result.rows[0]) : null;
  }

  // Find closest matching role using fuzzy matching
  static async findClosestRole(title: string): Promise<Role | null> {
    const text = `
      SELECT * FROM roles
      ORDER BY similarity(canonical_name, $1) DESC
      LIMIT 1
    `;
    const result = await query(text, [title]);
    return result.rows[0] ? this.mapRoleFromDb(result.rows[0]) : null;
  }

  // Get all roles with optional filtering
  static async findAll(filters?: {
    roleFamily?: string;
    seniorityLevel?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ roles: Role[]; total: number }> {
    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.roleFamily) {
      whereConditions.push(`role_family = $${paramIndex}`);
      params.push(filters.roleFamily);
      paramIndex++;
    }

    if (filters?.seniorityLevel) {
      whereConditions.push(`seniority_level = $${paramIndex}`);
      params.push(filters.seniorityLevel);
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

    const countText = `SELECT COUNT(*) as total FROM roles ${whereClause}`;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const dataText = `
      SELECT * FROM roles
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
      roles: dataResult.rows.map(this.mapRoleFromDb),
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  // Get role demand statistics
  static async getDemandStats(roleId?: string, limit = 20): Promise<RoleDemand[]> {
    let text = `
      SELECT
        r.id as role_id,
        r.canonical_name,
        COUNT(DISTINCT j.id) as total_jobs,
        COALESCE(
          (
            SELECT ta.change_percent
            FROM trend_analysis ta
            WHERE ta.entity_type = 'role' AND ta.entity_id = r.id
            ORDER BY ta.calculated_at DESC LIMIT 1
          ),
          0
        ) as growth_rate,
        COALESCE(
          (
            SELECT ta.status
            FROM trend_analysis ta
            WHERE ta.entity_type = 'role' AND ta.entity_id = r.id
            ORDER BY ta.calculated_at DESC LIMIT 1
          ),
          'STABLE'
        ) as trend,
        MAX(j.created_at) as last_updated
      FROM roles r
      LEFT JOIN jobs j ON j.role_id = r.id AND j.is_duplicate = false
    `;

    const params: any[] = [];
    if (roleId) {
      text += ' WHERE r.id = $1';
      params.push(roleId);
    }

    text += `
      GROUP BY r.id, r.canonical_name
      ORDER BY total_jobs DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await query(text, params);
    return result.rows.map((row) => ({
      roleId: row.role_id,
      canonicalName: row.canonical_name,
      totalJobs: parseInt(row.total_jobs, 10),
      growthRate: parseFloat(row.growth_rate) || 0,
      trend: row.trend,
      lastUpdated: new Date(row.last_updated || Date.now()),
    }));
  }

  // Get skill requirements for a role
  static async getSkillRequirements(roleId: string): Promise<Array<RoleSkillRequirement & { skillName: string; category?: string }>> {
    const text = `
      SELECT
        rsr.*,
        s.canonical_name as skill_name,
        s.category
      FROM role_skill_requirements rsr
      INNER JOIN skills s ON s.id = rsr.skill_id
      WHERE rsr.role_id = $1
      ORDER BY rsr.frequency DESC, rsr.average_requirement DESC
    `;
    const result = await query(text, [roleId]);
    return result.rows.map((row) => ({
      roleId: row.role_id,
      skillId: row.skill_id,
      skillName: row.skill_name,
      category: row.category,
      importance: row.importance,
      averageRequirement: parseFloat(row.average_requirement),
      frequency: parseInt(row.frequency, 10),
    }));
  }

  // Calculate and update role skill requirements from job data
  static async updateSkillRequirements(roleId: string): Promise<void> {
    const text = `
      WITH skill_stats AS (
        SELECT
          j.role_id,
          js.skill_id,
          COUNT(*) as appearance_count,
          COUNT(*) * 1.0 / (SELECT COUNT(*) FROM jobs WHERE role_id = $1 AND is_duplicate = false) as frequency_ratio,
          AVG(CASE WHEN js.is_required THEN 9.0 ELSE 7.0 END) as avg_requirement
        FROM jobs j
        INNER JOIN job_skills js ON js.job_id = j.id
        WHERE j.role_id = $1 AND j.is_duplicate = false
        GROUP BY j.role_id, js.skill_id
      )
      INSERT INTO role_skill_requirements (role_id, skill_id, importance, average_requirement, frequency, updated_at)
      SELECT
        role_id,
        skill_id,
        CASE
          WHEN frequency_ratio >= 0.7 THEN 'required'
          WHEN frequency_ratio >= 0.4 THEN 'preferred'
          ELSE 'optional'
        END as importance,
        ROUND(avg_requirement, 2) as average_requirement,
        appearance_count as frequency,
        NOW() as updated_at
      FROM skill_stats
      ON CONFLICT (role_id, skill_id)
      DO UPDATE SET
        importance = EXCLUDED.importance,
        average_requirement = EXCLUDED.average_requirement,
        frequency = EXCLUDED.frequency,
        updated_at = NOW()
    `;
    await query(text, [roleId]);
  }

  // Map DB row to Role
  private static mapRoleFromDb(row: any): Role {
    return {
      id: row.id,
      canonicalName: row.canonical_name,
      roleFamily: row.role_family,
      seniorityLevel: row.seniority_level,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
