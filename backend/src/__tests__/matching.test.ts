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

describe('Job Matching & Skill Gap Analysis Engine', () => {
  it('should calculate skill gaps for target role with prioritized insights', async () => {
    const res = await request(app)
      .post('/api/v1/skill-gaps/calculate')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ targetRoleId: 'role_fullstack' });

    expect(res.status).toBe(200);
    expect(res.body.data.roleId).toBe('role_fullstack');
    expect(res.body.data.gaps).toBeDefined();
    expect(res.body.data.roleReadiness).toBeDefined();
    expect(res.body.data.roleReadiness).toBeGreaterThan(0);
  });

  it('should calculate job match with explainable scoring breakdown', async () => {
    const res = await request(app)
      .post('/api/v1/matching/jobs/job_1')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.overallMatch).toBeDefined();
    expect(res.body.data.skillMatch).toBeDefined();
    expect(res.body.data.experienceMatch).toBeDefined();
    expect(res.body.data.matchedSkills).toBeDefined();
    expect(res.body.data.explanation).toBeDefined();
  });

  it('should return recommended jobs ranked by compatibility', async () => {
    const res = await request(app)
      .get('/api/v1/matching/jobs/recommended')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Verify results are sorted by match score descending
    for (let i = 1; i < res.body.data.length; i++) {
      expect(res.body.data[i - 1].overallMatch).toBeGreaterThanOrEqual(res.body.data[i].overallMatch);
    }
  });
});
