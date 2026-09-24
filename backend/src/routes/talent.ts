import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate, requireOrganization } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';

const router = Router();
router.use(authenticate);

// ---- SEARCH TALENT ----
router.post('/search', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { skills, roleId, minExperience, maxExperience, location, page: p, pageSize: ps } = req.body;
    const page = p || 1;
    const pageSize = ps || 25;
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT cp.*, u.email
      FROM candidate_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.visibility IN ('public', 'limited')
    `;
    const params: any[] = [];

    if (location) {
      query += ` AND cp.location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (minExperience !== undefined) {
      query += ` AND cp.total_experience_years >= ?`;
      params.push(minExperience);
    }
    if (maxExperience !== undefined) {
      query += ` AND cp.total_experience_years <= ?`;
      params.push(maxExperience);
    }

    const totalQuery = query.replace('SELECT cp.*, u.email', 'SELECT COUNT(*) as count');
    const total = (db.prepare(totalQuery).get(...params) as { count: number }).count;

    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    let candidates = db.prepare(query).all(...params) as any[];

    // If skill filter, match
    if (skills?.length) {
      candidates = candidates.filter(c => {
        const candidateSkills = db.prepare('SELECT skill_id FROM candidate_skills WHERE candidate_id = ?').all(c.id) as any[];
        const candidateSkillIds = new Set(candidateSkills.map(s => s.skill_id));
        return skills.some((s: string) => candidateSkillIds.has(s));
      });
    }

    // Score candidates if roleId is provided
    if (roleId) {
      const intel = getIntelligenceProvider();
      const requirements = await intel.getRoleRequirements(roleId);

      if (requirements) {
        for (const candidate of candidates) {
          const candidateSkills = db.prepare('SELECT skill_id, verified_score, assessment_score, self_reported_score FROM candidate_skills WHERE candidate_id = ?').all(candidate.id) as any[];
          const skillMap = new Map(candidateSkills.map(s => [s.skill_id, s.verified_score || s.assessment_score || s.self_reported_score || 0]));

          let totalReq = 0, totalCur = 0;
          for (const rs of requirements.skills) {
            totalReq += rs.requiredScore;
            totalCur += Math.min(skillMap.get(rs.skillId) || 0, rs.requiredScore);
          }
          candidate.roleMatch = totalReq > 0 ? Math.round((totalCur / totalReq) * 100) / 100 : 0;
        }
        candidates.sort((a, b) => (b.roleMatch || 0) - (a.roleMatch || 0));
      }
    }

    // Redact sensitive info for limited visibility
    candidates.forEach(c => {
      const parts = (c.name || '').trim().split(' ');
      c.first_name = parts[0] || '';
      c.last_name = parts.slice(1).join(' ') || '';
      c.firstName = c.first_name;
      c.lastName = c.last_name;

      if (c.visibility === 'limited') {
        delete c.email;
        c.phone = c.phone ? '***' : null;
      }
      c.target_roles = JSON.parse(c.target_roles || '[]');
      c.preferred_locations = JSON.parse(c.preferred_locations || '[]');
    });

    // Save search
    const searchId = generateId();
    const resolvedOrgId = (req as any).organizationId || req.body.organizationId || 'org_techcorp';
    db.prepare('INSERT INTO talent_searches (id, organization_id, searched_by, query, result_count) VALUES (?, ?, ?, ?, ?)')
      .run(searchId, resolvedOrgId, req.user!.userId, JSON.stringify(req.body), candidates.length);

    return res.json({ data: candidates, meta: { requestId: req.requestId, page, pageSize, total, searchId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SEARCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- CANDIDATE-ROLE MATCH (EMPLOYER VIEW) ----
router.post('/match/:candidateId/:roleId', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();

    const profile = db.prepare('SELECT * FROM candidate_profiles WHERE id = ? AND visibility IN ("public", "limited")').get(req.params.candidateId) as any;
    if (!profile) return res.status(404).json({ error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidate not found or not visible', requestId: req.requestId } });

    const requirements = await intel.getRoleRequirements(req.params.roleId);
    if (!requirements) return res.status(404).json({ error: { code: 'ROLE_NOT_FOUND', message: 'Role requirements not found', requestId: req.requestId } });

    const candidateSkills = db.prepare('SELECT skill_id, skill_name, verified_score, assessment_score, self_reported_score FROM candidate_skills WHERE candidate_id = ?').all(req.params.candidateId) as any[];
    const skillMap = new Map(candidateSkills.map(s => [s.skill_id, { name: s.skill_name, score: s.verified_score || s.assessment_score || s.self_reported_score || 0 }]));

    let totalReq = 0, totalCur = 0;
    const matched: string[] = [];
    const missing: string[] = [];
    const partial: Array<{ skill: string; has: number; needs: number }> = [];

    for (const rs of requirements.skills) {
      const candidate = skillMap.get(rs.skillId);
      totalReq += rs.requiredScore;
      if (candidate) {
        totalCur += Math.min(candidate.score, rs.requiredScore);
        if (candidate.score >= rs.requiredScore) matched.push(rs.skillName);
        else partial.push({ skill: rs.skillName, has: candidate.score, needs: rs.requiredScore });
      } else {
        missing.push(rs.skillName);
      }
    }

    const overallMatch = totalReq > 0 ? Math.round((totalCur / totalReq) * 100) / 100 : 0;

    return res.json({
      data: {
        candidateId: req.params.candidateId,
        roleId: req.params.roleId,
        roleName: requirements.roleName || req.params.roleId,
        overallMatch,
        matchedSkills: matched,
        missingSkills: missing,
        partialSkills: partial,
        recommendation: overallMatch >= 0.8 ? 'STRONG_FIT' : overallMatch >= 0.6 ? 'GOOD_FIT' : overallMatch >= 0.4 ? 'POTENTIAL_FIT' : 'GAP_EXISTS',
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'MATCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- SHORTLISTS ----
router.get('/shortlists', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const orgId = req.query.organizationId as string;
  const roleId = req.query.roleId as string;

  let query = `
    SELECT cs.*, cp.first_name, cp.last_name, cp.headline
    FROM candidate_shortlists cs
    JOIN candidate_profiles cp ON cs.candidate_id = cp.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (orgId) { query += ' AND cs.organization_id = ?'; params.push(orgId); }
  if (roleId) { query += ' AND cs.role_id = ?'; params.push(roleId); }

  query += ' ORDER BY cs.created_at DESC';
  const shortlists = db.prepare(query).all(...params);

  return res.json({ data: shortlists, meta: { requestId: req.requestId } });
});

router.post('/shortlists', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { candidateId, organizationId, roleId, status, notes } = req.body;
  if (!candidateId || !organizationId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'candidateId and organizationId are required', requestId: req.requestId } });

  try {
    const id = generateId();
    db.prepare('INSERT INTO candidate_shortlists (id, candidate_id, organization_id, role_id, status, notes, shortlisted_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, candidateId, organizationId, roleId || null, status || 'SHORTLISTED', notes || null, req.user!.userId);
    return res.status(201).json({ data: { id, message: 'Candidate shortlisted' }, meta: { requestId: req.requestId } });
  } catch {
    return res.status(409).json({ error: { code: 'ALREADY_SHORTLISTED', message: 'Already shortlisted', requestId: req.requestId } });
  }
});

router.put('/shortlists/:id', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { status, notes } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (status) { updates.push('status = ?'); params.push(status); }
  if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

  if (updates.length) {
    updates.push(`updated_at = datetime('now')`);
    params.push(req.params.id);
    db.prepare(`UPDATE candidate_shortlists SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  return res.json({ data: { message: 'Shortlist updated' }, meta: { requestId: req.requestId } });
});

router.delete('/shortlists/:id', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM candidate_shortlists WHERE id = ?').run(req.params.id);
  return res.json({ data: { message: 'Removed from shortlist' }, meta: { requestId: req.requestId } });
});

export default router;
