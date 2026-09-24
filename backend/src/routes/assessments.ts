import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate, authorize, auditLog } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();
router.use(authenticate);

// ---- LIST ASSESSMENTS ----
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 25;
  const offset = (page - 1) * pageSize;

  const total = (db.prepare('SELECT COUNT(*) as count FROM assessments').get() as { count: number }).count;
  const assessments = db.prepare('SELECT * FROM assessments ORDER BY created_at DESC LIMIT ? OFFSET ?').all(pageSize, offset) as any[];
  assessments.forEach(a => {
    a.skills = JSON.parse(a.skills || '[]');
    a.rules = JSON.parse(a.rules || '[]');
  });

  return res.json({ data: assessments, meta: { requestId: req.requestId, page, pageSize, total } });
});

// ---- GET ASSESSMENT ----
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id) as any;
  if (!assessment) {
    return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found', requestId: req.requestId } });
  }
  assessment.skills = JSON.parse(assessment.skills || '[]');
  assessment.rules = JSON.parse(assessment.rules || '[]');
  return res.json({ data: assessment, meta: { requestId: req.requestId } });
});

// ---- CREATE ASSESSMENT (admin only) ----
router.post('/', authorize('ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { title, description, targetRoleId, skills, difficulty, durationMinutes, rules } = req.body;
  if (!title) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Title is required', requestId: req.requestId } });
  }

  const id = generateId();
  db.prepare(`INSERT INTO assessments (id, title, description, target_role_id, skills, difficulty, duration_minutes, question_count, rules, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, title, description || null, targetRoleId || null, JSON.stringify(skills || []), difficulty || 'INTERMEDIATE', durationMinutes || 60, 0, JSON.stringify(rules || []), req.user!.userId);

  auditLog(req.user!.userId, 'ASSESSMENT_CREATED', 'assessment', id);
  return res.status(201).json({ data: { id, message: 'Assessment created' }, meta: { requestId: req.requestId } });
});

// ---- GET QUESTIONS (for an assessment during attempt) ----
router.get('/:id/questions', (req: Request, res: Response) => {
  const db = getDb();
  // Check active attempt
  const attempt = db.prepare('SELECT id, status FROM assessment_attempts WHERE assessment_id = ? AND user_id = ? AND status IN (?, ?)').get(req.params.id, req.user!.userId, 'CREATED', 'IN_PROGRESS') as any;

  const questions = db.prepare('SELECT id, assessment_id, type, text, options, skill_ids, difficulty, points, sort_order FROM assessment_questions WHERE assessment_id = ? ORDER BY sort_order').all(req.params.id) as any[];
  questions.forEach(q => {
    q.options = JSON.parse(q.options || '[]');
    q.skill_ids = JSON.parse(q.skill_ids || '[]');
    // Don't expose correct answers during assessment
  });

  return res.json({ data: questions, meta: { requestId: req.requestId, attemptId: attempt?.id, attemptStatus: attempt?.status } });
});

// ---- START ATTEMPT ----
router.post('/:id/attempt', (req: Request, res: Response) => {
  const db = getDb();
  const assessmentId = req.params.id;

  const assessment = db.prepare('SELECT id, duration_minutes FROM assessments WHERE id = ?').get(assessmentId) as any;
  if (!assessment) {
    return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found', requestId: req.requestId } });
  }

  const questions = db.prepare('SELECT id, assessment_id, type, text, options, skill_ids, difficulty, points, sort_order FROM assessment_questions WHERE assessment_id = ? ORDER BY sort_order').all(assessmentId) as any[];
  questions.forEach(q => {
    q.options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options;
    q.skill_ids = typeof q.skill_ids === 'string' ? JSON.parse(q.skill_ids || '[]') : q.skill_ids;
  });

  // Check for existing active attempt
  const existing = db.prepare('SELECT id FROM assessment_attempts WHERE assessment_id = ? AND user_id = ? AND status IN (?, ?)').get(assessmentId, req.user!.userId, 'CREATED', 'IN_PROGRESS') as any;
  if (existing) {
    return res.status(201).json({ data: { attemptId: existing.id, assessmentId, questions, message: 'Existing attempt found' }, meta: { requestId: req.requestId } });
  }

  const attemptId = generateId();
  db.prepare('INSERT INTO assessment_attempts (id, user_id, assessment_id, status) VALUES (?, ?, ?, ?)').run(attemptId, req.user!.userId, assessmentId, 'IN_PROGRESS');

  auditLog(req.user!.userId, 'ASSESSMENT_STARTED', 'assessment_attempt', attemptId);
  return res.status(201).json({ data: { attemptId, assessmentId, questions, message: 'Assessment started' }, meta: { requestId: req.requestId } });
});

// ---- SUBMIT ANSWER ----
router.post('/attempts/:attemptId/answers', (req: Request, res: Response) => {
  const db = getDb();
  const attempt = db.prepare('SELECT id, assessment_id, status FROM assessment_attempts WHERE id = ? AND user_id = ?').get(req.params.attemptId, req.user!.userId) as any;

  if (!attempt || attempt.status !== 'IN_PROGRESS') {
    return res.status(400).json({ error: { code: 'INVALID_ATTEMPT', message: 'No active attempt found', requestId: req.requestId } });
  }

  const { questionId, answer } = req.body;
  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'questionId and answer are required', requestId: req.requestId } });
  }

  // Check answer correctness
  const question = db.prepare('SELECT correct_answers, points FROM assessment_questions WHERE id = ? AND assessment_id = ?').get(questionId, attempt.assessment_id) as any;
  if (!question) {
    return res.status(404).json({ error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found', requestId: req.requestId } });
  }

  const correctAnswers = JSON.parse(question.correct_answers || '[]');
  let isCorrect = false;
  let score = 0;

  if (correctAnswers.length > 0) {
    if (Array.isArray(answer)) {
      isCorrect = correctAnswers.length === answer.length && correctAnswers.every((a: string) => answer.includes(a));
    } else {
      isCorrect = correctAnswers.includes(answer);
    }
    score = isCorrect ? question.points : 0;
  }

  // Upsert answer
  const existing = db.prepare('SELECT id FROM assessment_answers WHERE attempt_id = ? AND question_id = ?').get(req.params.attemptId, questionId) as any;
  if (existing) {
    db.prepare("UPDATE assessment_answers SET answer = ?, is_correct = ?, score = ?, answered_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(answer), isCorrect ? 1 : 0, score, existing.id);
  } else {
    db.prepare('INSERT INTO assessment_answers (id, attempt_id, question_id, answer, is_correct, score) VALUES (?, ?, ?, ?, ?, ?)')
      .run(generateId(), req.params.attemptId, questionId, JSON.stringify(answer), isCorrect ? 1 : 0, score);
  }

  return res.json({ data: { message: 'Answer recorded' }, meta: { requestId: req.requestId } });
});

// ---- REPORT INTEGRITY EVENT ----
router.post('/attempts/:attemptId/integrity', (req: Request, res: Response) => {
  const db = getDb();
  const attempt = db.prepare('SELECT id, status FROM assessment_attempts WHERE id = ? AND user_id = ?').get(req.params.attemptId, req.user!.userId) as any;

  if (!attempt || !['IN_PROGRESS', 'CREATED'].includes(attempt.status)) {
    return res.status(400).json({ error: { code: 'INVALID_ATTEMPT', message: 'No active attempt found', requestId: req.requestId } });
  }

  const { eventType, metadata, details, severity, source } = req.body;
  if (!eventType) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'eventType is required', requestId: req.requestId } });
  }

  const eventMetadata = metadata || details || null;
  db.prepare('INSERT INTO assessment_integrity_signals (id, attempt_id, event_type, metadata, severity, source) VALUES (?, ?, ?, ?, ?, ?)')
    .run(generateId(), req.params.attemptId, eventType, eventMetadata ? JSON.stringify(eventMetadata) : null, severity || 'LOW', source || 'CLIENT');

  return res.json({ data: { message: 'Integrity event logged' }, meta: { requestId: req.requestId } });
});

// ---- SUBMIT ASSESSMENT ----
router.post('/attempts/:attemptId/submit', (req: Request, res: Response) => {
  const db = getDb();
  const attempt = db.prepare('SELECT id, assessment_id, user_id, status FROM assessment_attempts WHERE id = ? AND user_id = ?').get(req.params.attemptId, req.user!.userId) as any;

  if (!attempt || attempt.status !== 'IN_PROGRESS') {
    return res.status(400).json({ error: { code: 'INVALID_ATTEMPT', message: 'No active attempt to submit', requestId: req.requestId } });
  }

  // Calculate scores
  const answers = db.prepare('SELECT aa.score, aa.is_correct, aq.skill_ids, aq.points FROM assessment_answers aa JOIN assessment_questions aq ON aa.question_id = aq.id WHERE aa.attempt_id = ?').all(req.params.attemptId) as any[];

  let totalScore = 0;
  let totalPoints = 0;
  const skillScores: Record<string, { earned: number; total: number }> = {};

  for (const ans of answers) {
    totalScore += ans.score || 0;
    totalPoints += ans.points || 0;
    const skills = JSON.parse(ans.skill_ids || '[]');
    for (const skillId of skills) {
      if (!skillScores[skillId]) skillScores[skillId] = { earned: 0, total: 0 };
      skillScores[skillId].earned += ans.score || 0;
      skillScores[skillId].total += ans.points || 0;
    }
  }

  const normalizedScore = totalPoints > 0 ? (totalScore / totalPoints) * 10 : 0;
  const normalizedSkillScores: Record<string, number> = {};
  for (const [skillId, scores] of Object.entries(skillScores)) {
    normalizedSkillScores[skillId] = scores.total > 0 ? (scores.earned / scores.total) * 10 : 0;
  }

  // Integrity summary
  const integrityEvents = db.prepare('SELECT event_type, severity FROM assessment_integrity_signals WHERE attempt_id = ?').all(req.params.attemptId) as any[];
  const eventsByType: Record<string, number> = {};
  let highSeverityCount = 0;
  for (const ev of integrityEvents) {
    eventsByType[ev.event_type] = (eventsByType[ev.event_type] || 0) + 1;
    if (ev.severity === 'HIGH') highSeverityCount++;
  }
  const integritySummary = {
    totalEvents: integrityEvents.length,
    eventsByType,
    highSeverityCount,
    overallRisk: highSeverityCount >= config.assessment.integrityThreshold ? 'HIGH' : integrityEvents.length > 5 ? 'MEDIUM' : 'LOW',
    integrityStatus: highSeverityCount >= config.assessment.integrityThreshold ? 'FLAGGED' : 'CLEAR',
  };

  const status = highSeverityCount >= config.assessment.integrityThreshold ? 'FLAGGED' : 'COMPLETED';

  db.prepare(`UPDATE assessment_attempts SET
    submitted_at = datetime('now'),
    status = ?,
    score = ?,
    skill_scores = ?,
    integrity_summary = ?
    WHERE id = ?
  `).run(status, Math.round(normalizedScore * 100) / 100, JSON.stringify(normalizedSkillScores), JSON.stringify(integritySummary), req.params.attemptId);

  // Update candidate skill profile with assessment scores
  const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as { id: string } | undefined;
  if (profile) {
    for (const [skillId, score] of Object.entries(normalizedSkillScores)) {
      const existing = db.prepare('SELECT id FROM candidate_skills WHERE candidate_id = ? AND skill_id = ?').get(profile.id, skillId) as any;
      const roundedScore = Math.round(score * 10) / 10;
      if (existing) {
        db.prepare("UPDATE candidate_skills SET assessment_score = ?, verified_score = ?, confidence = ?, last_assessed_at = datetime('now'), source = ? WHERE id = ?")
          .run(roundedScore, roundedScore, 0.85, 'ASSESSMENT', existing.id);
      }
    }
  }

  auditLog(req.user!.userId, 'ASSESSMENT_SUBMITTED', 'assessment_attempt', req.params.attemptId, { score: normalizedScore, status });

  return res.json({
    data: {
      attemptId: req.params.attemptId,
      status,
      score: Math.round(normalizedScore * 100) / 100,
      passed: normalizedScore >= 6.0,
      skillScores: normalizedSkillScores,
      integritySummary,
    },
    meta: { requestId: req.requestId }
  });
});

// ---- GET ATTEMPT RESULTS ----
router.get('/attempts/:attemptId', (req: Request, res: Response) => {
  const db = getDb();
  const attempt = db.prepare('SELECT * FROM assessment_attempts WHERE id = ?').get(req.params.attemptId) as any;

  if (!attempt) {
    return res.status(404).json({ error: { code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found', requestId: req.requestId } });
  }

  // Authorization: only own attempts or admin
  if (attempt.user_id !== req.user!.userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied', requestId: req.requestId } });
  }

  attempt.skill_scores = attempt.skill_scores ? JSON.parse(attempt.skill_scores) : null;
  attempt.integrity_summary = attempt.integrity_summary ? JSON.parse(attempt.integrity_summary) : null;

  return res.json({ data: attempt, meta: { requestId: req.requestId } });
});

// ---- MY ATTEMPTS ----
router.get('/my/attempts', (req: Request, res: Response) => {
  const db = getDb();
  const attempts = db.prepare(`
    SELECT aa.*, a.title as assessment_title
    FROM assessment_attempts aa
    JOIN assessments a ON aa.assessment_id = a.id
    WHERE aa.user_id = ?
    ORDER BY aa.started_at DESC
  `).all(req.user!.userId) as any[];

  attempts.forEach(a => {
    a.skill_scores = a.skill_scores ? JSON.parse(a.skill_scores) : null;
    a.integrity_summary = a.integrity_summary ? JSON.parse(a.integrity_summary) : null;
  });

  return res.json({ data: attempts, meta: { requestId: req.requestId } });
});

export default router;
