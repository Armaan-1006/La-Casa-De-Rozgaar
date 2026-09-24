import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';
import type { SkillGap } from '../types.js';

const router = Router();
router.use(authenticate);

// ---- CALCULATE SKILL GAPS FOR TARGET ROLE ----
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();
    const roleId = req.body.roleId || req.body.targetRoleId;

    if (!roleId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'roleId or targetRoleId is required', requestId: req.requestId } });
    }

    const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    if (!profile) {
      return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found', requestId: req.requestId } });
    }

    // Get role requirements from Module 1
    const requirements = await intel.getRoleRequirements(roleId);
    if (!requirements) {
      return res.status(404).json({ error: { code: 'ROLE_NOT_FOUND', message: 'Role requirements not found', requestId: req.requestId } });
    }

    // Get candidate skills
    const candidateSkills = db.prepare('SELECT skill_id, skill_name, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) as any[];
    const skillMap = new Map(candidateSkills.map(s => [s.skill_id, s]));

    // Calculate gaps
    const gaps: SkillGap[] = [];
    for (const req_skill of requirements.skills) {
      const candidateSkill = skillMap.get(req_skill.skillId);
      const currentScore = candidateSkill
        ? (candidateSkill.verified_score || candidateSkill.assessment_score || candidateSkill.self_reported_score || 0)
        : 0;
      const gap = Math.max(0, req_skill.requiredScore - currentScore);

      // Get market signal for priority calculation
      const marketSignal = await intel.getMarketSkillSignal(req_skill.skillId);
      const marketDemand = marketSignal?.demand || 50;

      // Priority: gap size + role importance + market demand
      const priorityScore = (gap / 10) * 0.4 + (importanceWeight(req_skill.importance)) * 0.35 + (marketDemand / 100) * 0.25;
      const priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
        priorityScore > 0.7 ? 'CRITICAL' :
        priorityScore > 0.5 ? 'HIGH' :
        priorityScore > 0.3 ? 'MEDIUM' : 'LOW';

      const reason = buildGapReason(req_skill.skillName, gap, req_skill.importance, marketSignal?.trend || 'STABLE');

      gaps.push({
        skillId: req_skill.skillId,
        skillName: req_skill.skillName,
        currentScore: Math.round(currentScore * 10) / 10,
        requiredScore: req_skill.requiredScore,
        gap: Math.round(gap * 10) / 10,
        priority,
        marketDemand,
        reason,
      });
    }

    // Sort by priority
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Store in database
    db.prepare('DELETE FROM skill_gaps WHERE candidate_id = ? AND role_id = ?').run(profile.id, roleId);
    const insertGap = db.prepare('INSERT INTO skill_gaps (id, candidate_id, role_id, skill_id, skill_name, current_score, required_score, gap, priority, market_demand, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const gap of gaps) {
      insertGap.run(generateId(), profile.id, roleId, gap.skillId, gap.skillName, gap.currentScore, gap.requiredScore, gap.gap, gap.priority, gap.marketDemand, gap.reason);
    }

    // Calculate role readiness
    const totalRequired = requirements.skills.reduce((sum, s) => sum + s.requiredScore, 0);
    const totalCurrent = gaps.reduce((sum, g) => sum + g.currentScore, 0);
    const roleReadiness = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) / 100 : 0;

    return res.json({
      data: {
        roleId,
        roleReadiness,
        totalGaps: gaps.filter(g => g.gap > 0).length,
        gaps,
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'SKILL_GAP_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- GET STORED GAPS ----
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
  if (!profile) {
    return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });
  }

  const roleId = req.query.roleId as string;
  let gaps;
  if (roleId) {
    gaps = db.prepare('SELECT * FROM skill_gaps WHERE candidate_id = ? AND role_id = ? ORDER BY calculated_at DESC').all(profile.id, roleId);
  } else {
    gaps = db.prepare('SELECT * FROM skill_gaps WHERE candidate_id = ? ORDER BY calculated_at DESC').all(profile.id);
  }

  return res.json({ data: gaps, meta: { requestId: req.requestId } });
});

function importanceWeight(importance: string): number {
  switch (importance) {
    case 'CRITICAL': return 1.0;
    case 'HIGH': return 0.75;
    case 'MEDIUM': return 0.5;
    case 'LOW': return 0.25;
    default: return 0.5;
  }
}

function buildGapReason(skillName: string, gap: number, importance: string, trend: string): string {
  const parts: string[] = [];
  if (gap > 3) parts.push(`Significant gap of ${gap.toFixed(1)} points in ${skillName}`);
  else if (gap > 1) parts.push(`Moderate gap of ${gap.toFixed(1)} points in ${skillName}`);
  else if (gap > 0) parts.push(`Minor gap of ${gap.toFixed(1)} points in ${skillName}`);
  else parts.push(`${skillName} meets or exceeds requirements`);

  if (importance === 'CRITICAL') parts.push('Critical skill for this role');
  else if (importance === 'HIGH') parts.push('High importance for this role');

  if (trend === 'GROWING' || trend === 'EMERGING') parts.push(`Market demand is ${trend.toLowerCase()}`);

  return parts.join('. ') + '.';
}

export default router;
