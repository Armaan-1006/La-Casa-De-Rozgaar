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

describe('Candidate Profile & Skills API', () => {
  it('should retrieve candidate profile with associated skills and experience', async () => {
    const res = await request(app)
      .get('/api/v1/candidates/profile')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('Rahul');
    expect(res.body.data.lastName).toBe('Sharma');
    expect(res.body.data.skills).toBeDefined();
    expect(res.body.data.skills.length).toBeGreaterThan(0);
    expect(res.body.data.experience).toBeDefined();
  });

  it('should update candidate profile details', async () => {
    const res = await request(app)
      .put('/api/v1/candidates/profile')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        headline: 'Lead Full Stack Architect & Tech Lead',
        bio: 'Updated bio with 6+ years of distributed systems engineering.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.headline).toBe('Lead Full Stack Architect & Tech Lead');
  });

  it('should add or update candidate skills', async () => {
    const res = await request(app)
      .post('/api/v1/candidates/skills')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        skillId: 'skill_rust',
        skillName: 'Rust',
        selfReportedScore: 7.5,
        yearsExperience: 2,
      });

    expect(res.status).toBe(201);

    const skillsRes = await request(app)
      .get('/api/v1/candidates/skills')
      .set('Authorization', `Bearer ${candidateToken}`);

    const rust = skillsRes.body.data.find((s: any) => s.skill_id === 'skill_rust');
    expect(rust).toBeDefined();
    expect(rust.self_reported_score).toBe(7.5);
  });
});
