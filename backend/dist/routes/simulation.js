import { Router } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';
const router = Router();
router.use(authenticate);
// ---- RUN SIMULATION ----
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const intel = getIntelligenceProvider();
        const { targetRoleId, skillChanges } = req.body;
        if (!targetRoleId || !skillChanges?.length) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'targetRoleId and skillChanges are required', requestId: req.requestId } });
        }
        const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.userId);
        if (!profile) {
            return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });
        }
        // Get role requirements
        const requirements = await intel.getRoleRequirements(targetRoleId);
        if (!requirements) {
            return res.status(404).json({ error: { code: 'ROLE_NOT_FOUND', message: 'Role requirements not found', requestId: req.requestId } });
        }
        // Get current skills
        const candidateSkills = (await db.prepare('SELECT skill_id, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) || []);
        const skillMap = new Map(candidateSkills.map(s => [s.skill_id, s.verified_score || s.assessment_score || s.self_reported_score || 0]));
        // Apply hypothetical changes
        const simulatedSkills = new Map(skillMap);
        for (const change of skillChanges) {
            simulatedSkills.set(change.skillId, change.targetScore);
        }
        // Calculate simulated gaps
        const remainingGaps = [];
        let totalRequired = 0;
        let totalSimulated = 0;
        let metCount = 0;
        for (const reqSkill of requirements.skills) {
            const simulatedScore = simulatedSkills.get(reqSkill.skillId) || 0;
            const gap = Math.max(0, reqSkill.requiredScore - simulatedScore);
            totalRequired += reqSkill.requiredScore;
            totalSimulated += Math.min(simulatedScore, reqSkill.requiredScore);
            if (gap > 0) {
                const marketSignal = await intel.getMarketSkillSignal(reqSkill.skillId);
                remainingGaps.push({
                    skillId: reqSkill.skillId,
                    skillName: reqSkill.skillName,
                    currentScore: simulatedScore,
                    requiredScore: reqSkill.requiredScore,
                    gap: Math.round(gap * 10) / 10,
                    priority: gap > 3 ? 'CRITICAL' : gap > 1.5 ? 'HIGH' : gap > 0.5 ? 'MEDIUM' : 'LOW',
                    marketDemand: marketSignal?.demand || 50,
                    reason: `Remaining gap after simulation: ${gap.toFixed(1)} points`,
                });
            }
            else {
                metCount++;
            }
        }
        const roleReadiness = totalRequired > 0 ? Math.round((totalSimulated / totalRequired) * 100) / 100 : 0;
        const skillCoverage = requirements.skills.length > 0 ? Math.round((metCount / requirements.skills.length) * 100) / 100 : 0;
        // Estimate compatible jobs
        const currentReadiness = (() => {
            let tReq = 0, tCur = 0;
            for (const rs of requirements.skills) {
                tReq += rs.requiredScore;
                tCur += Math.min(skillMap.get(rs.skillId) || 0, rs.requiredScore);
            }
            return tReq > 0 ? tCur / tReq : 0;
        })();
        const improvement = Math.round((roleReadiness - currentReadiness) * 100);
        // Learning requirements
        const learningRequirements = skillChanges.map((change) => {
            const currentScore = skillMap.get(change.skillId) || 0;
            const skillName = requirements.skills.find(s => s.skillId === change.skillId)?.skillName || change.skillId;
            const gap = change.targetScore - currentScore;
            // Rough estimate: ~20 hours per point improvement
            const estimatedHours = Math.max(0, Math.round(gap * 20));
            return {
                skillId: change.skillId,
                skillName,
                currentScore: Math.round(currentScore * 10) / 10,
                targetScore: change.targetScore,
                estimatedHours,
            };
        });
        const result = {
            roleReadiness,
            skillCoverage,
            remainingGaps,
            compatibleJobsEstimate: { total: Math.round(roleReadiness * 50), improvement },
            learningRequirements,
            disclaimer: 'SIMULATION: These results are scenario-based compatibility estimates. They do not guarantee employment outcomes. Actual results depend on many factors including market conditions, hiring decisions, and individual circumstances.',
        };
        return res.json({ data: result, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SIMULATION_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- SAVE SCENARIO ----
router.post('/scenarios', async (req, res) => {
    try {
        const db = getDb();
        const { name, targetRoleId, targetRoleName, currentRoleTitle, timelineMonths, investmentHoursPerWeek, estimatedBudget, projectedSalary, projectedGrowthPct, roiMultiple, bridgeSkills, difficulty, feasibility, steps, skillChanges, result, } = req.body;
        if (!name) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name is required', requestId: req.requestId } });
        }
        const id = generateId();
        const payloadResult = {
            ...(typeof result === 'object' && result !== null ? result : {}),
            target_role_name: targetRoleName || 'Target Role',
            current_role_title: currentRoleTitle || 'Current Role',
            timeline_months: timelineMonths || 6,
            investment_hours_per_week: investmentHoursPerWeek || 10,
            estimated_budget: estimatedBudget || 0,
            projected_salary: projectedSalary || 0,
            projected_growth_pct: projectedGrowthPct || 0,
            roi_multiple: roiMultiple || 1.0,
            bridge_skills: bridgeSkills || [],
            difficulty: difficulty || 'MODERATE',
            feasibility: feasibility || 'HIGH',
            steps: steps || [],
        };
        await db.prepare(`
      INSERT INTO career_scenarios (
        id, user_id, name, target_role_id, skill_changes, result, model_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.userId, name, targetRoleId || 'role_custom', JSON.stringify(skillChanges || []), JSON.stringify(payloadResult), '1.0');
        return res.status(201).json({ data: { id, message: 'Scenario saved' }, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SCENARIO_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- LIST SCENARIOS ----
router.get('/scenarios', async (req, res) => {
    try {
        const db = getDb();
        let scenarios = (await db.prepare('SELECT * FROM career_scenarios WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId) || []);
        if (!scenarios.length) {
            scenarios = (await db.prepare('SELECT * FROM career_scenarios ORDER BY created_at DESC LIMIT 20').all() || []);
        }
        const formatted = scenarios.map((s) => {
            let parsedResult = {};
            try {
                parsedResult = typeof s.result === 'string' ? JSON.parse(s.result || '{}') : s.result || {};
            }
            catch {
                parsedResult = {};
            }
            let parsedSkillChanges = [];
            try {
                parsedSkillChanges = typeof s.skill_changes === 'string' ? JSON.parse(s.skill_changes || '[]') : s.skill_changes || [];
            }
            catch {
                parsedSkillChanges = [];
            }
            return {
                ...s,
                ...parsedResult,
                skill_changes: parsedSkillChanges,
                bridge_skills: parsedResult.bridge_skills || [],
                steps: parsedResult.steps || [],
                target_role_name: parsedResult.target_role_name || s.target_role_id,
                current_role_title: parsedResult.current_role_title || 'Software Engineer',
                timeline_months: parsedResult.timeline_months || 6,
                investment_hours_per_week: parsedResult.investment_hours_per_week || 10,
                estimated_budget: parsedResult.estimated_budget || 0,
                projected_salary: parsedResult.projected_salary || 0,
                projected_growth_pct: parsedResult.projected_growth_pct || 0,
                roi_multiple: parsedResult.roi_multiple || 1.0,
                difficulty: parsedResult.difficulty || 'MODERATE',
                feasibility: parsedResult.feasibility || 'HIGH',
                result: parsedResult,
            };
        });
        return res.json({ data: formatted, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SCENARIOS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- GET SCENARIO ----
router.get('/scenarios/:id', async (req, res) => {
    try {
        const db = getDb();
        const scenario = await db.prepare('SELECT * FROM career_scenarios WHERE id = ?').get(req.params.id);
        if (!scenario) {
            return res.status(404).json({ error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario not found', requestId: req.requestId } });
        }
        let parsedResult = {};
        try {
            parsedResult = typeof scenario.result === 'string' ? JSON.parse(scenario.result || '{}') : scenario.result || {};
        }
        catch {
            parsedResult = {};
        }
        let parsedSkillChanges = [];
        try {
            parsedSkillChanges = typeof scenario.skill_changes === 'string' ? JSON.parse(scenario.skill_changes || '[]') : scenario.skill_changes || [];
        }
        catch {
            parsedSkillChanges = [];
        }
        const formatted = {
            ...scenario,
            ...parsedResult,
            skill_changes: parsedSkillChanges,
            bridge_skills: parsedResult.bridge_skills || [],
            steps: parsedResult.steps || [],
            target_role_name: parsedResult.target_role_name || scenario.target_role_id,
            current_role_title: parsedResult.current_role_title || 'Software Engineer',
            timeline_months: parsedResult.timeline_months || 6,
            investment_hours_per_week: parsedResult.investment_hours_per_week || 10,
            estimated_budget: parsedResult.estimated_budget || 0,
            projected_salary: parsedResult.projected_salary || 0,
            projected_growth_pct: parsedResult.projected_growth_pct || 0,
            roi_multiple: parsedResult.roi_multiple || 1.0,
            difficulty: parsedResult.difficulty || 'MODERATE',
            feasibility: parsedResult.feasibility || 'HIGH',
            result: parsedResult,
        };
        return res.json({ data: formatted, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SCENARIO_GET_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- DELETE SCENARIO ----
router.delete('/scenarios/:id', async (req, res) => {
    try {
        const db = getDb();
        await db.prepare('DELETE FROM career_scenarios WHERE id = ?').run(req.params.id);
        return res.json({ data: { message: 'Scenario deleted' }, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SCENARIO_DELETE_ERROR', message: err.message, requestId: req.requestId } });
    }
});
export default router;
//# sourceMappingURL=simulation.js.map