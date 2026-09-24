import { Router, Request, Response } from 'express';
import { getDb } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';

const router = Router();
router.use(authenticate);

// ---- CAREER DASHBOARD ----
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as any;
    if (!profile) {
      return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });
    }

    const skills = db.prepare('SELECT COUNT(*) as count FROM candidate_skills WHERE candidate_id = ?').get(profile.id) as { count: number };
    const gaps = db.prepare('SELECT * FROM skill_gaps WHERE candidate_id = ? ORDER BY gap DESC LIMIT 5').all(profile.id) as any[];
    const matches = db.prepare('SELECT * FROM job_matches WHERE candidate_id = ? ORDER BY overall_match DESC LIMIT 5').all(profile.id) as any[];
    matches.forEach(m => { m.matched_skills = JSON.parse(m.matched_skills || '[]'); m.missing_skills = JSON.parse(m.missing_skills || '[]'); });

    const learning = db.prepare('SELECT status, COUNT(*) as count FROM learning_progress WHERE user_id = ? GROUP BY status').all(req.user!.userId) as any[];
    const scenarios = db.prepare('SELECT COUNT(*) as count FROM career_scenarios WHERE user_id = ?').get(req.user!.userId) as { count: number };
    const savedJobs = db.prepare('SELECT COUNT(*) as count FROM saved_jobs WHERE candidate_id = ?').get(profile.id) as { count: number };

    return res.json({
      data: {
        profile: { name: `${profile.first_name} ${profile.last_name}`, headline: profile.headline },
        skillCount: skills.count,
        topGaps: gaps.map(g => ({ skillName: g.skill_name, gap: g.gap, priority: g.priority })),
        topMatches: matches.slice(0, 5).map(m => ({ jobId: m.job_id, overallMatch: m.overall_match, skillMatch: m.skill_match })),
        learningProgress: learning.reduce((acc: Record<string, number>, l: any) => { acc[l.status] = l.count; return acc; }, {}),
        scenarioCount: scenarios.count,
        savedJobCount: savedJobs.count,
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'DASHBOARD_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- ROLE READINESS ----
router.get('/role-readiness/:roleId', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();

    const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const requirements = await intel.getRoleRequirements(req.params.roleId);
    if (!requirements) return res.status(404).json({ error: { code: 'ROLE_NOT_FOUND', message: 'Role not found', requestId: req.requestId } });

    const candidateSkills = db.prepare('SELECT skill_id, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) as any[];
    const skillMap = new Map(candidateSkills.map(s => [s.skill_id, s.verified_score || s.assessment_score || s.self_reported_score || 0]));

    let totalRequired = 0;
    let totalCurrent = 0;
    let metCount = 0;
    const breakdown: Array<{ skillName: string; required: number; current: number; met: boolean }> = [];

    for (const req_skill of requirements.skills) {
      const current = skillMap.get(req_skill.skillId) || 0;
      totalRequired += req_skill.requiredScore;
      totalCurrent += Math.min(current, req_skill.requiredScore);
      const met = current >= req_skill.requiredScore;
      if (met) metCount++;
      breakdown.push({ skillName: req_skill.skillName, required: req_skill.requiredScore, current: Math.round(current * 10) / 10, met });
    }

    const readiness = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) / 100 : 0;
    const skillCoverage = requirements.skills.length > 0 ? Math.round((metCount / requirements.skills.length) * 100) / 100 : 0;

    return res.json({
      data: {
        roleId: req.params.roleId,
        roleName: requirements.roleName || req.params.roleId,
        readiness,
        skillCoverage,
        breakdown,
        totalSkillsRequired: requirements.skills.length,
        totalSkillsMet: metCount,
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'READINESS_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- ADJACENT ROLES ----
router.get('/adjacent-roles', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();

    const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const candidateSkills = db.prepare('SELECT skill_id, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) as any[];
    const skillMap = new Map(candidateSkills.map(s => [s.skill_id, s.verified_score || s.assessment_score || s.self_reported_score || 0]));

    // Search for roles
    const roles = await intel.searchRoles('');

    // Calculate readiness for each role
    const adjacentRoles: Array<{ roleId: string; roleName: string; readiness: number; transferableSkills: string[]; gapSkills: string[] }> = [];

    for (const role of roles) {
      const requirements = await intel.getRoleRequirements(role.id);
      if (!requirements) continue;

      let totalReq = 0;
      let totalCur = 0;
      const transferable: string[] = [];
      const gaps: string[] = [];

      for (const rs of requirements.skills) {
        totalReq += rs.requiredScore;
        const current = skillMap.get(rs.skillId) || 0;
        totalCur += Math.min(current, rs.requiredScore);
        if (current >= rs.requiredScore * 0.7) transferable.push(rs.skillName);
        else if (current < rs.requiredScore * 0.3) gaps.push(rs.skillName);
      }

      const readiness = totalReq > 0 ? Math.round((totalCur / totalReq) * 100) / 100 : 0;
      if (readiness >= 0.3 && readiness < 1.0) {
        adjacentRoles.push({ roleId: role.id, roleName: role.title || role.name || role.id, readiness, transferableSkills: transferable, gapSkills: gaps });
      }
    }

    adjacentRoles.sort((a, b) => b.readiness - a.readiness);

    return res.json({ data: adjacentRoles.slice(0, 10), meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ADJACENT_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- MARKET INSIGHTS (for candidate) ----
router.get('/market-insights', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();

    const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

    const candidateSkills = db.prepare('SELECT skill_id, skill_name FROM candidate_skills WHERE candidate_id = ?').all(profile.id) as any[];

    const insights: Array<{ skillName: string; trend: string; demand: number; growthRate: number; advice: string }> = [];
    for (const skill of candidateSkills) {
      const signal = await intel.getMarketSkillSignal(skill.skill_id);
      if (signal) {
        let advice = '';
        if (signal.trend === 'EMERGING') advice = 'High-growth area. Invest heavily in this skill to build an early advantage.';
        else if (signal.trend === 'GROWING') advice = 'Increasing demand. Continue developing this skill.';
        else if (signal.trend === 'STABLE') advice = 'Reliable demand. Maintain proficiency.';
        else if (signal.trend === 'DECLINING') advice = 'Demand declining. Consider complementary skills.';

        insights.push({
          skillName: skill.skill_name,
          trend: signal.trend,
          demand: signal.demand,
          growthRate: signal.growthRate,
          advice,
        });
      }
    }

    insights.sort((a, b) => b.demand - a.demand);

    return res.json({ data: insights, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'INSIGHTS_ERROR', message: err.message, requestId: req.requestId } });
  }
});

export default router;
