import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server.js';
import { runMigrations } from '../database/migrate.js';
import { seedDatabase } from '../database/seed.js';

const app = createApp();
let candidateToken: string;

beforeAll(async () => {
  runMigrations();
  seedDatabase();

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'rahul@example.com', password: 'password123' });
  candidateToken = loginRes.body.data.accessToken;
});

describe('Secure Assessment Engine & Integrity Signals', () => {
  let assessmentId: string;
  let attemptId: string;
  let questions: any[];

  it('should list available assessments', async () => {
    const res = await request(app)
      .get('/api/v1/assessments')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    assessmentId = res.body.data[0].id;
  });

  it('should start an assessment attempt and return questions without answers', async () => {
    const res = await request(app)
      .post(`/api/v1/assessments/${assessmentId}/attempt`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(201);
    expect(res.body.data.attemptId).toBeDefined();
    expect(res.body.data.questions).toBeDefined();
    expect(res.body.data.questions.length).toBeGreaterThan(0);

    // Verify correct_answer is stripped for security
    expect(res.body.data.questions[0].correct_answer).toBeUndefined();

    attemptId = res.body.data.attemptId;
    questions = res.body.data.questions;
  });

  it('should submit answers for assessment questions', async () => {
    const firstQ = questions[0];
    const res = await request(app)
      .post(`/api/v1/assessments/attempts/${attemptId}/answers`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        questionId: firstQ.id,
        answer: 'Promises / microtasks',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Answer recorded');
  });

  it('should record anti-cheat integrity signals (e.g. TAB_SWITCH, COPY_PASTE)', async () => {
    const res = await request(app)
      .post(`/api/v1/assessments/attempts/${attemptId}/integrity`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        eventType: 'TAB_SWITCH',
        severity: 'MEDIUM',
        details: { switchedAt: new Date().toISOString(), durationMs: 2500 },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Integrity event logged');
  });

  it('should submit assessment, calculate final score, and compute integrity summary', async () => {
    const res = await request(app)
      .post(`/api/v1/assessments/attempts/${attemptId}/submit`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.score).toBeDefined();
    expect(res.body.data.passed).toBeDefined();
    expect(res.body.data.integritySummary).toBeDefined();
    expect(res.body.data.integritySummary.totalEvents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.integritySummary.integrityStatus).toBeDefined();
  });
});
