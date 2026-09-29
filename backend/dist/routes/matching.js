import { Router } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';
const router = Router();
router.use(authenticate);
// ---- MATCH CANDIDATE TO JOB ----
router.post('/jobs/:jobId', async (req, res) => {
    try {
        const db = getDb();
        const intel = getIntelligenceProvider();
        let profile = await db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user.userId);
        if (!profile) {
            const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
            const newProfileId = generateId();
            const defaultName = user?.name || (user?.email ? user.email.split('@')[0] : 'Candidate');
            await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user.userId, defaultName);
            profile = await db.prepare('SELECT * FROM candidate_profiles WHERE id = ?').get(newProfileId);
        }
        const job = await intel.getJob(req.params.jobId);
        if (!job) {
            return res.status(404).json({ error: { code: 'JOB_NOT_FOUND', message: 'Job not found', requestId: req.requestId } });
        }
        const candidateSkills = (await db.prepare('SELECT skill_id, skill_name, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) || []);
        const experience = (await db.prepare('SELECT * FROM candidate_experience WHERE candidate_id = ?').all(profile.id) || []);
        const match = await calculateJobMatch(profile, candidateSkills, experience, job, intel);
        // Delete existing match if any then insert
        try {
            await db.prepare('DELETE FROM job_matches WHERE candidate_id = ? AND job_id = ?').run(profile.id, job.id);
        }
        catch { }
        await db.prepare(`INSERT INTO job_matches (id, candidate_id, job_id, overall_match, skill_match, experience_match, role_match, location_match, matched_skills, missing_skills, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(generateId(), profile.id, job.id, match.overallMatch, match.skillMatch, match.experienceMatch, match.roleMatch, match.locationMatch, JSON.stringify(match.matchedSkills), JSON.stringify(match.missingSkills), match.explanation);
        return res.json({ data: match, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'MATCHING_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- RECOMMENDED JOBS ----
router.get('/jobs/recommended', async (req, res) => {
    try {
        const db = getDb();
        const intel = getIntelligenceProvider();
        let profile = await db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user.userId);
        if (!profile) {
            const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
            const newProfileId = generateId();
            const defaultName = user?.name || (user?.email ? user.email.split('@')[0] : 'Candidate');
            await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user.userId, defaultName);
            profile = await db.prepare('SELECT * FROM candidate_profiles WHERE id = ?').get(newProfileId);
        }
        try {
            profile.target_roles = typeof profile.target_roles === 'string' ? JSON.parse(profile.target_roles || '[]') : (profile.target_roles || []);
        }
        catch {
            profile.target_roles = [];
        }
        try {
            profile.preferred_locations = typeof profile.preferred_locations === 'string' ? JSON.parse(profile.preferred_locations || '[]') : (profile.preferred_locations || []);
        }
        catch {
            profile.preferred_locations = [];
        }
        const candidateSkills = (await db.prepare('SELECT skill_id, skill_name, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) || []);
        const experience = (await db.prepare('SELECT * FROM candidate_experience WHERE candidate_id = ?').all(profile.id) || []);
        // Search jobs matching candidate's skills
        const skillIds = candidateSkills.map((s) => s.skill_id);
        const searchResult = await intel.searchJobs({ skills: skillIds, pageSize: 50 });
        // Calculate matches for all jobs
        const matches = [];
        for (const job of searchResult.jobs) {
            const match = await calculateJobMatch(profile, candidateSkills, experience, job, intel);
            matches.push(match);
        }
        // Sort by overall match
        matches.sort((a, b) => b.overallMatch - a.overallMatch);
        // Paginate
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const start = (page - 1) * pageSize;
        const paginated = matches.slice(start, start + pageSize);
        return res.json({
            data: paginated,
            meta: { requestId: req.requestId, page, pageSize, total: matches.length }
        });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'RECOMMENDATION_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- SAVED JOBS ----
router.get('/saved', async (req, res) => {
    try {
        const db = getDb();
        const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.userId);
        if (!profile)
            return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });
        const saved = (await db.prepare('SELECT * FROM saved_jobs WHERE candidate_id = ? ORDER BY saved_at DESC').all(profile.id) || []);
        return res.json({ data: saved, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SAVED_JOBS_ERROR', message: err.message, requestId: req.requestId } });
    }
});
router.post('/saved/:jobId', async (req, res) => {
    try {
        const db = getDb();
        let profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.userId);
        if (!profile) {
            const newProfileId = generateId();
            await db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(newProfileId, req.user.userId, 'Candidate');
            profile = { id: newProfileId };
        }
        try {
            await db.prepare('INSERT INTO saved_jobs (id, candidate_id, job_id, notes) VALUES (?, ?, ?, ?)').run(generateId(), profile.id, req.params.jobId, req.body.notes || null);
            return res.status(201).json({ data: { message: 'Job saved' }, meta: { requestId: req.requestId } });
        }
        catch {
            return res.json({ data: { message: 'Job already saved' }, meta: { requestId: req.requestId } });
        }
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'SAVE_JOB_ERROR', message: err.message, requestId: req.requestId } });
    }
});
router.delete('/saved/:jobId', async (req, res) => {
    try {
        const db = getDb();
        const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.userId);
        if (!profile)
            return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });
        await db.prepare('DELETE FROM saved_jobs WHERE candidate_id = ? AND job_id = ?').run(profile.id, req.params.jobId);
        return res.json({ data: { message: 'Job removed from saved' }, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'DELETE_SAVED_JOB_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- MATCHING ENGINE ----
async function calculateJobMatch(profile, candidateSkills, experience, job, intel) {
    // 1. Skill Match
    const jobSkills = new Set(job.skills || []);
    const candidateSkillMap = new Map(candidateSkills.map((s) => [s.skill_id, s]));
    const matchedSkills = [];
    const missingSkills = [];
    for (const skillId of jobSkills) {
        const sk = candidateSkillMap.get(skillId);
        if (sk) {
            matchedSkills.push(sk.skill_name);
        }
        else {
            const skillInfo = await intel.getSkill(skillId);
            missingSkills.push(skillInfo?.name || skillId);
        }
    }
    const skillMatch = jobSkills.size > 0 ? matchedSkills.length / jobSkills.size : 0;
    // 2. Experience Match
    let totalExpYears = 0;
    for (const exp of experience) {
        const start = new Date(exp.start_date || exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.end_date || exp.endDate || new Date());
        totalExpYears += (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    }
    totalExpYears = Math.round(totalExpYears * 10) / 10;
    let experienceMatch = 0;
    if (job.experienceRequired) {
        const { min, max } = job.experienceRequired;
        if (totalExpYears >= min && totalExpYears <= max) {
            experienceMatch = 1.0;
        }
        else if (totalExpYears >= min) {
            experienceMatch = Math.max(0.6, 1 - (totalExpYears - max) * 0.1);
        }
        else {
            experienceMatch = Math.max(0, totalExpYears / min);
        }
    }
    else {
        experienceMatch = 0.7; // No requirement means reasonable match
    }
    // 3. Role Match
    let targetRoles = [];
    try {
        targetRoles = Array.isArray(profile.target_roles)
            ? profile.target_roles
            : JSON.parse(profile.target_roles || '[]');
    }
    catch {
        targetRoles = [];
    }
    const roleMatch = targetRoles.some((r) => (job.title || '').toLowerCase().includes(r.replace('role_', '').toLowerCase())) ? 1.0 : 0.5;
    // 4. Location Match
    let preferredLocations = [];
    try {
        preferredLocations = Array.isArray(profile.preferred_locations)
            ? profile.preferred_locations
            : JSON.parse(profile.preferred_locations || '[]');
    }
    catch {
        preferredLocations = [];
    }
    const jobLoc = (job.location || '').toLowerCase();
    let locationMatch = 0.5;
    if (jobLoc.includes('remote'))
        locationMatch = 1.0;
    else if (preferredLocations.some((l) => jobLoc.includes(l.toLowerCase())))
        locationMatch = 1.0;
    else if (profile.location && jobLoc.includes(profile.location.toLowerCase().split(',')[0]))
        locationMatch = 0.8;
    // 5. Overall Match (weighted)
    const overallMatch = Math.round((skillMatch * 0.40 + experienceMatch * 0.25 + roleMatch * 0.20 + locationMatch * 0.15) * 100) / 100;
    // 6. Explanation
    const explanationParts = [];
    if (skillMatch >= 0.8)
        explanationParts.push(`Strong skill alignment: ${matchedSkills.join(', ')}`);
    else if (skillMatch >= 0.5)
        explanationParts.push(`Moderate skill match: ${matchedSkills.join(', ')}`);
    else
        explanationParts.push(`Limited skill overlap. Matched: ${matchedSkills.join(', ') || 'none'}`);
    if (missingSkills.length)
        explanationParts.push(`Missing: ${missingSkills.join(', ')}`);
    explanationParts.push(`Experience: ${totalExpYears} years (required: ${job.experienceRequired?.min || 0}-${job.experienceRequired?.max || 'N/A'})`);
    if (locationMatch >= 0.8)
        explanationParts.push(`Good location fit`);
    return {
        jobId: job.id,
        job,
        overallMatch,
        skillMatch: Math.round(skillMatch * 100) / 100,
        experienceMatch: Math.round(experienceMatch * 100) / 100,
        roleMatch: Math.round(roleMatch * 100) / 100,
        locationMatch: Math.round(locationMatch * 100) / 100,
        matchedSkills,
        missingSkills,
        explanation: explanationParts.join('. ') + '.',
    };
}
export default router;
//# sourceMappingURL=matching.js.map