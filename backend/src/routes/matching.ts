import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';
import type { JobMatch } from '../types.js';

const router = Router();
router.use(authenticate);

// ---- MATCH CANDIDATE TO JOB ----
router.post('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();

    const profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as any;
    if (!profile) {
      return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });
    }

    const job = await intel.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: { code: 'JOB_NOT_FOUND', message: 'Job not found', requestId: req.requestId } });
    }

    const candidateSkills = db.prepare('SELECT skill_id, skill_name, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) as any[];
    const experience = db.prepare('SELECT * FROM candidate_experience WHERE candidate_id = ?').all(profile.id) as any[];

    const match = await calculateJobMatch(profile, candidateSkills, experience, job, intel);

    // Store match
    db.prepare(`INSERT OR REPLACE INTO job_matches (id, candidate_id, job_id, overall_match, skill_match, experience_match, role_match, location_match, matched_skills, missing_skills, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      generateId(), profile.id, job.id, match.overallMatch, match.skillMatch, match.experienceMatch,
      match.roleMatch, match.locationMatch, JSON.stringify(match.matchedSkills),
      JSON.stringify(match.missingSkills), match.explanation
    );

    return res.json({ data: match, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'MATCHING_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- RECOMMENDED JOBS ----
router.get('/jobs/recommended', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const intel = getIntelligenceProvider();

    const profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as any;
    if (!profile) {
      return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });
    }
    profile.target_roles = JSON.parse(profile.target_roles || '[]');
    profile.preferred_locations = JSON.parse(profile.preferred_locations || '[]');

    const candidateSkills = db.prepare('SELECT skill_id, skill_name, self_reported_score, assessment_score, verified_score FROM candidate_skills WHERE candidate_id = ?').all(profile.id) as any[];
    const experience = db.prepare('SELECT * FROM candidate_experience WHERE candidate_id = ?').all(profile.id) as any[];

    // Search jobs matching candidate's skills
    const skillIds = candidateSkills.map((s: any) => s.skill_id);
    const searchResult = await intel.searchJobs({ skills: skillIds, pageSize: 50 });

    // Calculate matches for all jobs
    const matches: JobMatch[] = [];
    for (const job of searchResult.jobs) {
      const match = await calculateJobMatch(profile, candidateSkills, experience, job, intel);
      matches.push(match);
    }

    // Sort by overall match
    matches.sort((a, b) => b.overallMatch - a.overallMatch);

    // Paginate
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const start = (page - 1) * pageSize;
    const paginated = matches.slice(start, start + pageSize);

    return res.json({
      data: paginated,
      meta: { requestId: req.requestId, page, pageSize, total: matches.length }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'RECOMMENDATION_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- SAVED JOBS ----
router.get('/saved', (req: Request, res: Response) => {
  const db = getDb();
  const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
  if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

  const saved = db.prepare('SELECT * FROM saved_jobs WHERE candidate_id = ? ORDER BY saved_at DESC').all(profile.id);
  return res.json({ data: saved, meta: { requestId: req.requestId } });
});

router.post('/saved/:jobId', (req: Request, res: Response) => {
  const db = getDb();
  const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
  if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

  try {
    db.prepare('INSERT INTO saved_jobs (id, candidate_id, job_id, notes) VALUES (?, ?, ?, ?)').run(
      generateId(), profile.id, req.params.jobId, req.body.notes || null
    );
    return res.status(201).json({ data: { message: 'Job saved' }, meta: { requestId: req.requestId } });
  } catch {
    return res.json({ data: { message: 'Job already saved' }, meta: { requestId: req.requestId } });
  }
});

router.delete('/saved/:jobId', (req: Request, res: Response) => {
  const db = getDb();
  const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
  if (!profile) return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found', requestId: req.requestId } });

  db.prepare('DELETE FROM saved_jobs WHERE candidate_id = ? AND job_id = ?').run(profile.id, req.params.jobId);
  return res.json({ data: { message: 'Job removed from saved' }, meta: { requestId: req.requestId } });
});

// ---- MATCHING ENGINE ----
async function calculateJobMatch(profile: any, candidateSkills: any[], experience: any[], job: any, intel: any): Promise<JobMatch> {
  // 1. Skill Match
  const jobSkills = new Set(job.skills || []);
  const candidateSkillMap = new Map(candidateSkills.map((s: any) => [s.skill_id, s]));
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skillId of jobSkills) {
    const sk = candidateSkillMap.get(skillId);
    if (sk) {
      matchedSkills.push(sk.skill_name);
    } else {
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
    } else if (totalExpYears >= min) {
      experienceMatch = Math.max(0.6, 1 - (totalExpYears - max) * 0.1);
    } else {
      experienceMatch = Math.max(0, totalExpYears / min);
    }
  } else {
    experienceMatch = 0.7; // No requirement means reasonable match
  }

  // 3. Role Match
  const targetRoles = Array.isArray(profile.target_roles)
    ? profile.target_roles
    : JSON.parse(profile.target_roles || '[]');
  const roleMatch = targetRoles.some((r: string) => job.title.toLowerCase().includes(r.replace('role_', '').toLowerCase())) ? 1.0 : 0.5;

  // 4. Location Match
  const preferredLocations = Array.isArray(profile.preferred_locations)
    ? profile.preferred_locations
    : JSON.parse(profile.preferred_locations || '[]');
  const jobLoc = (job.location || '').toLowerCase();
  let locationMatch = 0.5;
  if (jobLoc.includes('remote')) locationMatch = 1.0;
  else if (preferredLocations.some((l: string) => jobLoc.includes(l.toLowerCase()))) locationMatch = 1.0;
  else if (profile.location && jobLoc.includes(profile.location.toLowerCase().split(',')[0])) locationMatch = 0.8;

  // 5. Overall Match (weighted)
  const overallMatch = Math.round(
    (skillMatch * 0.40 + experienceMatch * 0.25 + roleMatch * 0.20 + locationMatch * 0.15) * 100
  ) / 100;

  // 6. Explanation
  const explanationParts: string[] = [];
  if (skillMatch >= 0.8) explanationParts.push(`Strong skill alignment: ${matchedSkills.join(', ')}`);
  else if (skillMatch >= 0.5) explanationParts.push(`Moderate skill match: ${matchedSkills.join(', ')}`);
  else explanationParts.push(`Limited skill overlap. Matched: ${matchedSkills.join(', ') || 'none'}`);

  if (missingSkills.length) explanationParts.push(`Missing: ${missingSkills.join(', ')}`);
  explanationParts.push(`Experience: ${totalExpYears} years (required: ${job.experienceRequired?.min || 0}-${job.experienceRequired?.max || 'N/A'})`);
  if (locationMatch >= 0.8) explanationParts.push(`Good location fit`);

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
