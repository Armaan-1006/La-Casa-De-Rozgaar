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

describe('Career What-If Simulation Engine', () => {
  it('should run simulation and project readiness delta with learning requirements', async () => {
    const res = await request(app)
      .post('/api/v1/simulation')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        targetRoleId: 'role_fullstack',
        skillChanges: [
          { skillId: 'skill_docker', targetScore: 8.5 },
          { skillId: 'skill_graphql', targetScore: 8.0 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.roleReadiness).toBeDefined();
    expect(res.body.data.skillCoverage).toBeDefined();
    expect(res.body.data.compatibleJobsEstimate).toBeDefined();
    expect(res.body.data.learningRequirements).toBeDefined();
    expect(res.body.data.learningRequirements.length).toBe(2);
    expect(res.body.data.disclaimer).toContain('SIMULATION:');
  });

  it('should save and list career simulation scenarios', async () => {
    const saveRes = await request(app)
      .post('/api/v1/simulation/scenarios')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        name: 'Target Full Stack Lead 2025',
        targetRoleId: 'role_fullstack',
        skillChanges: [{ skillId: 'skill_docker', targetScore: 9.0 }],
        result: { roleReadiness: 0.95 },
      });

    expect(saveRes.status).toBe(201);
    expect(saveRes.body.data.id).toBeDefined();

    const listRes = await request(app)
      .get('/api/v1/simulation/scenarios')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);
  });
});
