import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// ---- LIST INTERVIEW QUESTIONS ----
router.get('/questions', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const offset = (page - 1) * pageSize;
    const roleId = req.query.roleId as string;
    const difficulty = req.query.difficulty as string;
    const topic = req.query.topic as string;

    let query = 'SELECT * FROM interview_questions WHERE 1=1';
    const params: any[] = [];

    if (roleId) { query += ' AND role_id = ?'; params.push(roleId); }
    if (difficulty) { query += ' AND difficulty = ?'; params.push(difficulty); }
    if (topic) { query += ' AND (question LIKE ? OR key_points LIKE ?)'; params.push(`%${topic}%`, `%${topic}%`); }

    const totalQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countRes = await db.prepare(totalQuery).get(...params) as { count: number | string };
    const total = Number(countRes?.count || 0);

    query += ' ORDER BY id ASC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const questions = (await db.prepare(query).all(...params) || []) as any[];

    return res.json({ data: questions, meta: { requestId: req.requestId, page, pageSize, total } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'INTERVIEWS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- REPORT INTERVIEW QUESTION ----
router.post('/questions', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { company, roleId, question, topic, difficulty, type, source } = req.body;

    if (!company || !roleId || !question || !topic) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'company, roleId, question, topic are required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare('INSERT INTO interview_questions (id, company, role_id, question, topic, difficulty, type, source, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, company, roleId, question, topic, difficulty || 'MEDIUM', type || 'TECHNICAL', source || 'REPORTED', req.user!.userId);

    return res.status(201).json({ data: { id, message: 'Interview question reported' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'QUESTION_REPORT_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- PERSONALIZED PREPARATION SET ----
router.get('/preparation', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const roleId = req.query.roleId as string;
    const company = req.query.company as string;

    if (!roleId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'roleId is required', requestId: req.requestId } });
    }

    // Get questions for role
    let query = 'SELECT * FROM interview_questions WHERE role_id = ?';
    const params: any[] = [roleId];
    if (company) {
      query += ' AND company LIKE ?';
      params.push(`%${company}%`);
    }
    query += ' ORDER BY reported_at DESC LIMIT 50';

    const questions = (await db.prepare(query).all(...params) || []) as any[];

    // Get candidate gaps for focus areas
    const profile = await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
    const focusAreas: Array<{ area: string; reason: string; relevance: number }> = [];

    if (profile) {
      const gaps = (await db.prepare('SELECT skill_name, gap, priority FROM skill_gaps WHERE candidate_id = ? AND role_id = ? ORDER BY gap DESC LIMIT 5').all(profile.id, roleId) || []) as any[];
      for (const gap of gaps) {
        focusAreas.push({
          area: gap.skill_name,
          reason: `Skill gap of ${(gap.gap || 0).toFixed(1)} (${gap.priority} priority)`,
          relevance: (gap.gap || 0) / 10,
        });
      }
    }

    // Extract unique topics
    const topics = [...new Set(questions.map((q: any) => q.topic))];

    return res.json({
      data: {
        roleId,
        company: company || null,
        questions,
        topics,
        focusAreas,
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'PREPARATION_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- REPORT INTERVIEW EXPERIENCE ----
router.post('/reports', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { company, roleId, experienceSummary, difficulty, topics, outcome } = req.body;

    if (!company || !roleId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'company and roleId are required', requestId: req.requestId } });
    }

    const id = generateId();
    await db.prepare('INSERT INTO interview_reports (id, user_id, company, role_id, experience_summary, difficulty, topics, outcome) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.user!.userId, company, roleId, experienceSummary || null, difficulty || null, JSON.stringify(topics || []), outcome || null);

    return res.status(201).json({ data: { id, message: 'Interview report submitted' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'REPORT_SUBMIT_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- LIST INTERVIEW REPORTS ----
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const reports = (await db.prepare('SELECT * FROM interview_reports WHERE user_id = ? ORDER BY reported_at DESC').all(req.user!.userId) || []) as any[];
    reports.forEach((r: any) => {
      try { r.topics = typeof r.topics === 'string' ? JSON.parse(r.topics || '[]') : (r.topics || []); } catch { r.topics = []; }
    });
    return res.json({ data: reports, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'REPORTS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

export default router;
