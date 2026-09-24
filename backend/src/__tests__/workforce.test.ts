import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server.js';
import { runMigrations } from '../database/migrate.js';
import { seedDatabase } from '../database/seed.js';

const app = createApp();
let employerToken: string;
let orgId = 'org_techcorp';

beforeAll(async () => {
  runMigrations();
  seedDatabase();

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'hr@techcorp.in', password: 'password123' });
  employerToken = loginRes.body.data.accessToken;
});

describe('Employer Talent Discovery & Workforce Intelligence', () => {
  it('should search talent pool by skills and role requirements', async () => {
    const res = await request(app)
      .post('/api/v1/talent/search')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        skills: ['skill_react', 'skill_nodejs'],
        roleId: 'role_fullstack',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].first_name).toBeDefined();
    expect(res.body.data[0].roleMatch).toBeDefined();
  });

  it('should run workforce skill gap analysis across organization profiles', async () => {
    const res = await request(app)
      .post('/api/v1/workforce/gaps/analyze')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ profileId: 'wf_eng_fullstack' });

    expect(res.status).toBe(200);
    expect(res.body.data.gaps).toBeDefined();
    expect(res.body.data.summary.totalGaps).toBeGreaterThan(0);
    expect(res.body.data.summary.criticalGaps).toBeDefined();
  });

  it('should generate automated Hire vs Upskill recommendations', async () => {
    // First run gap analysis
    await request(app)
      .post('/api/v1/workforce/gaps/analyze')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ profileId: 'wf_eng_fullstack' });

    const res = await request(app)
      .post('/api/v1/workforce/gaps/recommendation')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ profileId: 'wf_eng_fullstack' });

    expect(res.status).toBe(200);
    expect(res.body.data.recommendations).toBeDefined();
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(res.body.data.summary).toBeDefined();
    expect(['HIRE', 'UPSKILL', 'HYBRID']).toContain(res.body.data.recommendations[0].action);
  });
});
