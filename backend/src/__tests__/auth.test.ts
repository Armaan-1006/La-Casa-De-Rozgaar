import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server.js';
import { runMigrations } from '../database/migrate.js';
import { seedDatabase } from '../database/seed.js';

const app = createApp();

beforeAll(() => {
  runMigrations();
  seedDatabase();
});

describe('Authentication & User Management', () => {
  it('should register a new candidate user', async () => {
    const testEmail = `newcandidate_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'password123',
        name: 'New Candidate',
        role: 'candidate',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should reject registration with existing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'rahul@example.com',
        password: 'password123',
        name: 'Duplicate Rahul',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rahul@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('rahul@example.com');
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rahul@example.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should get current user profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rahul@example.com', password: 'password123' });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('rahul@example.com');
    expect(res.body.data.role).toBe('candidate');
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
