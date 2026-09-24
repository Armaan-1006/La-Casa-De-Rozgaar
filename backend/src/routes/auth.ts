import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, generateId } from '../database/connection.js';
import { config } from '../config.js';
import { authenticate, auditLog } from '../middleware/auth.js';
import type { AuthTokenPayload, UserRole } from '../types.js';

const router = Router();

// ---- REGISTER ----
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password are required', requestId: req.requestId } });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already registered', requestId: req.requestId } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateId();
    const userRole: UserRole = (role?.toUpperCase() === 'RECRUITER' || role?.toUpperCase() === 'EMPLOYER_ADMIN' || role?.toUpperCase() === 'WORKFORCE_PLANNER' || role?.toUpperCase() === 'ADMIN') ? role.toUpperCase() as UserRole : 'CANDIDATE';

    db.prepare('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)').run(userId, email, passwordHash, userRole);

    // Auto-create candidate profile if CANDIDATE role
    if (userRole === 'CANDIDATE') {
      const profileId = generateId();
      db.prepare('INSERT INTO candidate_profiles (id, user_id, name) VALUES (?, ?, ?)').run(profileId, userId, name || email.split('@')[0]);
    }

    // Generate token
    const tokenPayload: AuthTokenPayload = { userId, email, role: userRole, jti: generateId() };
    const token = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
    const refreshToken = jwt.sign({ userId, type: 'refresh', jti: generateId() }, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions);

    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?)').run(sessionId, userId, token, refreshToken, expiresAt);

    auditLog(userId, 'USER_REGISTERED', 'user', userId);

    return res.status(201).json({
      data: {
        userId,
        email,
        role: userRole,
        token,
        accessToken: token,
        refreshToken,
        user: { id: userId, email, role: userRole.toLowerCase() }
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'REGISTRATION_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- LOGIN ----
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password are required', requestId: req.requestId } });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?').get(email) as { id: string; email: string; password_hash: string; role: UserRole } | undefined;

    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', requestId: req.requestId } });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', requestId: req.requestId } });
    }

    const tokenPayload: AuthTokenPayload = { userId: user.id, email: user.email, role: user.role, jti: generateId() };
    const token = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
    const refreshToken = jwt.sign({ userId: user.id, type: 'refresh', jti: generateId() }, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions);

    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?)').run(sessionId, user.id, token, refreshToken, expiresAt);

    auditLog(user.id, 'USER_LOGIN', 'user', user.id);

    return res.json({
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        token,
        accessToken: token,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role.toLowerCase() }
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'LOGIN_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- LOGOUT ----
router.post('/logout', authenticate, (req: Request, res: Response) => {
  const token = req.headers.authorization?.slice(7);
  if (token) {
    const db = getDb();
    db.prepare('UPDATE sessions SET revoked = 1 WHERE token = ?').run(token);
    auditLog(req.user!.userId, 'USER_LOGOUT', 'user', req.user!.userId);
  }
  return res.json({ data: { message: 'Logged out successfully' }, meta: { requestId: req.requestId } });
});

// ---- REFRESH TOKEN ----
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required', requestId: req.requestId } });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret) as { userId: string; type: string };
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token', requestId: req.requestId } });
    }

    const db = getDb();
    const session = db.prepare('SELECT id FROM sessions WHERE refresh_token = ? AND revoked = 0').get(refreshToken) as { id: string } | undefined;
    if (!session) {
      return res.status(401).json({ error: { code: 'SESSION_REVOKED', message: 'Session expired or revoked', requestId: req.requestId } });
    }

    const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(decoded.userId) as { id: string; email: string; role: UserRole } | undefined;
    if (!user) {
      return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId } });
    }

    // Revoke old session
    db.prepare('UPDATE sessions SET revoked = 1 WHERE id = ?').run(session.id);

    // Create new tokens
    const tokenPayload: AuthTokenPayload = { userId: user.id, email: user.email, role: user.role, jti: generateId() };
    const newToken = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
    const newRefreshToken = jwt.sign({ userId: user.id, type: 'refresh', jti: generateId() }, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions);

    const newSessionId = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?)').run(newSessionId, user.id, newToken, newRefreshToken, expiresAt);

    return res.json({
      data: { token: newToken, refreshToken: newRefreshToken },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(401).json({ error: { code: 'REFRESH_ERROR', message: 'Invalid or expired refresh token', requestId: req.requestId } });
  }
});

// ---- ME (current user) ----
router.get('/me', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, role, email_verified, created_at FROM users WHERE id = ?').get(req.user!.userId) as any;
  if (!user) {
    return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId } });
  }
  return res.json({
    data: {
      ...user,
      role: user.role.toLowerCase(),
      userRole: user.role,
    },
    meta: { requestId: req.requestId }
  });
});

export default router;
