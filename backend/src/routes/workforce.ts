import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate, authorize, requireOrganization } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';

const router = Router();
router.use(authenticate);

// ---- WORKFORCE PROFILES ----
router.get('/profiles', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const orgId = req.query.organizationId as string;
  if (!orgId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'organizationId is required', requestId: req.requestId } });

  const profiles = db.prepare('SELECT * FROM workforce_profiles WHERE organization_id = ? ORDER BY created_at DESC').all(orgId) as any[];
  profiles.forEach(p => {
    p.current_skills = JSON.parse(p.current_skills || '[]');
    p.target_skills = JSON.parse(p.target_skills || '[]');
    p.metadata = JSON.parse(p.metadata || '{}');
  });
  return res.json({ data: profiles, meta: { requestId: req.requestId } });
});

router.post('/profiles', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { organizationId, department, roleId, employeeCount, currentSkills, targetSkills } = req.body;
  if (!organizationId || !department || !roleId) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'organizationId, department, roleId are required', requestId: req.requestId } });
  }

  const id = generateId();
  db.prepare(`INSERT INTO workforce_profiles (id, organization_id, department, role_id, employee_count, current_skills, target_skills, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, organizationId, department, roleId, employeeCount || 0, JSON.stringify(currentSkills || []), JSON.stringify(targetSkills || []), req.user!.userId);

  return res.status(201).json({ data: { id, message: 'Workforce profile created' }, meta: { requestId: req.requestId } });
});

router.put('/profiles/:id', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { department, roleId, employeeCount, currentSkills, targetSkills } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (department) { updates.push('department = ?'); params.push(department); }
  if (roleId) { updates.push('role_id = ?'); params.push(roleId); }
  if (employeeCount !== undefined) { updates.push('employee_count = ?'); params.push(employeeCount); }
  if (currentSkills) { updates.push('current_skills = ?'); params.push(JSON.stringify(currentSkills)); }
  if (targetSkills) { updates.push('target_skills = ?'); params.push(JSON.stringify(targetSkills)); }

  if (updates.length) {
    updates.push(`updated_at = datetime('now')`);
    params.push(req.params.id);
    db.prepare(`UPDATE workforce_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  return res.json({ data: { message: 'Profile updated' }, meta: { requestId: req.requestId } });
});

// ---- WORKFORCE GAP ANALYSIS ----
router.post('/gaps/analyze', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();
    const { profileId } = req.body;

    if (!profileId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'profileId is required', requestId: req.requestId } });

    const profile = db.prepare('SELECT * FROM workforce_profiles WHERE id = ?').get(profileId) as any;
    if (!profile) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Workforce profile not found', requestId: req.requestId } });

    const currentSkills = JSON.parse(profile.current_skills || '[]') as Array<{ skillId: string; averageScore: number; coverage: number }>;
    const targetSkills = JSON.parse(profile.target_skills || '[]') as Array<{ skillId: string; targetScore: number }>;
    const requirements = await intel.getRoleRequirements(profile.role_id);

    const allTargets = [...targetSkills];
    if (requirements) {
      for (const rs of requirements.skills) {
        if (!allTargets.find(t => t.skillId === rs.skillId)) {
          allTargets.push({ skillId: rs.skillId, targetScore: rs.requiredScore });
        }
      }
    }

    const currentMap = new Map(currentSkills.map(s => [s.skillId, s]));
    const gaps: Array<{ skillId: string; skillName: string; currentAvg: number; target: number; gap: number; coverage: number; impactedEmployees: number; priority: string }> = [];

    for (const target of allTargets) {
      const current = currentMap.get(target.skillId);
      const skill = await intel.getSkill(target.skillId);
      const currentAvg = current?.averageScore || 0;
      const gap = Math.max(0, target.targetScore - currentAvg);
      const coverage = current?.coverage || 0;
      const impactedEmployees = Math.round(profile.employee_count * (1 - coverage));

      if (gap > 0 || coverage < 1) {
        const marketSignal = await intel.getMarketSkillSignal(target.skillId);
        const marketDemand = marketSignal?.demand || 50;

        let priority: string;
        if (gap > 3 || (gap > 2 && impactedEmployees > profile.employee_count * 0.5)) priority = 'CRITICAL';
        else if (gap > 2 || (gap > 1 && marketDemand > 70)) priority = 'HIGH';
        else if (gap > 1) priority = 'MEDIUM';
        else priority = 'LOW';

        gaps.push({
          skillId: target.skillId,
          skillName: skill?.name || target.skillId,
          currentAvg: Math.round(currentAvg * 10) / 10,
          target: target.targetScore,
          gap: Math.round(gap * 10) / 10,
          coverage: Math.round(coverage * 100),
          impactedEmployees,
          priority,
        });
      }
    }

    gaps.sort((a, b) => b.gap - a.gap);

    // Store gaps
    for (const gap of gaps) {
      db.prepare(`INSERT OR REPLACE INTO workforce_gaps (id, profile_id, skill_id, skill_name, current_avg, target_score, gap, coverage, impacted_employees, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(generateId(), profileId, gap.skillId, gap.skillName, gap.currentAvg, gap.target, gap.gap, gap.coverage, gap.impactedEmployees, gap.priority);
    }

    return res.json({
      data: {
        profileId,
        department: profile.department,
        roleId: profile.role_id,
        employeeCount: profile.employee_count,
        gaps,
        summary: {
          totalGaps: gaps.length,
          criticalGaps: gaps.filter(g => g.priority === 'CRITICAL').length,
          highGaps: gaps.filter(g => g.priority === 'HIGH').length,
          totalImpactedEmployees: new Set(gaps.map(g => g.impactedEmployees)).size,
        },
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'GAP_ANALYSIS_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- HIRE VS UPSKILL RECOMMENDATION ----
router.post('/gaps/recommendation', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();
    const { profileId } = req.body;

    if (!profileId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'profileId is required', requestId: req.requestId } });

    const gaps = db.prepare('SELECT * FROM workforce_gaps WHERE profile_id = ? ORDER BY gap DESC').all(profileId) as any[];
    if (!gaps.length) return res.json({ data: { recommendations: [], message: 'No gaps found. Run gap analysis first.' }, meta: { requestId: req.requestId } });

    const recommendations: Array<{ skillId: string; skillName: string; action: string; reason: string; estimatedCost: string; timeline: string }> = [];

    for (const gap of gaps) {
      const marketSignal = await intel.getMarketSkillSignal(gap.skill_id);
      const trend = marketSignal?.trend || 'STABLE';

      // Decision logic
      let action: string;
      let reason: string;
      let timeline: string;
      let estimatedCost: string;

      if (gap.gap > 4 && gap.coverage < 30) {
        action = 'HIRE';
        reason = `Large skill gap (${gap.gap}) with low coverage (${gap.coverage}%). Hiring provides immediate capability.`;
        timeline = '1-3 months (recruitment cycle)';
        estimatedCost = 'HIGH (recruitment + salary)';
      } else if (gap.gap > 3 && trend === 'EMERGING') {
        action = 'HIRE';
        reason = `Gap in emerging skill (${gap.skill_name}). Few internal employees to upskill. External talent available.`;
        timeline = '1-3 months';
        estimatedCost = 'HIGH';
      } else if (gap.gap <= 2 && gap.coverage > 50) {
        action = 'UPSKILL';
        reason = `Moderate gap (${gap.gap}) with good coverage (${gap.coverage}%). Upskilling is cost-effective.`;
        timeline = '2-4 months (training programs)';
        estimatedCost = 'LOW-MEDIUM (training costs)';
      } else if (gap.gap <= 3) {
        action = 'UPSKILL';
        reason = `Bridgeable gap. Structured learning paths can close this gap efficiently.`;
        timeline = '3-6 months';
        estimatedCost = 'MEDIUM';
      } else {
        action = 'HYBRID';
        reason = `Gap of ${gap.gap} with ${gap.coverage}% coverage. Consider hiring for immediate needs and upskilling existing staff.`;
        timeline = '3-6 months (phased approach)';
        estimatedCost = 'MEDIUM-HIGH';
      }

      recommendations.push({
        skillId: gap.skill_id,
        skillName: gap.skill_name,
        action,
        reason,
        estimatedCost,
        timeline,
      });
    }

    return res.json({
      data: {
        recommendations,
        summary: {
          hire: recommendations.filter(r => r.action === 'HIRE').length,
          upskill: recommendations.filter(r => r.action === 'UPSKILL').length,
          hybrid: recommendations.filter(r => r.action === 'HYBRID').length,
        },
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'RECOMMENDATION_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- WORKFORCE PLANS ----
router.get('/plans', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const orgId = req.query.organizationId as string;
  if (!orgId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'organizationId is required', requestId: req.requestId } });

  const plans = db.prepare('SELECT * FROM workforce_plans WHERE organization_id = ? ORDER BY created_at DESC').all(orgId) as any[];
  plans.forEach(p => { p.actions = JSON.parse(p.actions || '[]'); });
  return res.json({ data: plans, meta: { requestId: req.requestId } });
});

router.post('/plans', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { organizationId, profileId, name, actions, timeline, budget } = req.body;
  if (!organizationId || !name) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'organizationId and name are required', requestId: req.requestId } });

  const id = generateId();
  db.prepare(`INSERT INTO workforce_plans (id, organization_id, profile_id, name, actions, timeline, budget, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, organizationId, profileId || null, name, JSON.stringify(actions || []), timeline || null, budget || null, req.user!.userId);

  return res.status(201).json({ data: { id, message: 'Workforce plan created' }, meta: { requestId: req.requestId } });
});

export default router;
