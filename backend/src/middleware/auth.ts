import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getDb, generateId } from '../database/connection.js';
import type { AuthTokenPayload, UserRole } from '../types.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
      requestId?: string;
    }
  }
}

/**
 * Attach a unique request ID to every request.
 */
export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = generateId();
  next();
}

/**
 * Authenticate via Bearer token.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header', requestId: req.requestId }
    });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    // Verify session not revoked
    const db = getDb();
    const session = db.prepare('SELECT revoked FROM sessions WHERE token = ?').get(token) as { revoked: number } | undefined;
    if (!session || session.revoked) {
      res.status(401).json({
        error: { code: 'SESSION_REVOKED', message: 'Session has been revoked', requestId: req.requestId }
      });
      return;
    }
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token', requestId: req.requestId }
    });
  }
}

/**
 * Authorization: require specific roles.
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated', requestId: req.requestId }
      });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions', requestId: req.requestId }
      });
      return;
    }
    next();
  };
}

/**
 * Verify organization membership (for employer endpoints).
 */
export function requireOrganization(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated', requestId: req.requestId }
    });
    return;
  }

  const db = getDb();
  let orgId = req.params.orgId || req.body?.organizationId || req.query?.organizationId;
  if (!orgId) {
    const userOrg = db.prepare('SELECT organization_id FROM organization_users WHERE user_id = ?').get(req.user.userId) as { organization_id: string } | undefined;
    if (userOrg) {
      orgId = userOrg.organization_id;
    }
  }

  if (!orgId && req.user.role !== 'ADMIN' && req.user.role !== 'EMPLOYER_ADMIN') {
    res.status(400).json({
      error: { code: 'MISSING_ORG', message: 'Organization ID is required', requestId: req.requestId }
    });
    return;
  }

  if (orgId) {
    const membership = db.prepare(
      'SELECT role FROM organization_users WHERE organization_id = ? AND user_id = ?'
    ).get(orgId, req.user.userId) as { role: string } | undefined;

    if (!membership && req.user.role !== 'ADMIN') {
      res.status(403).json({
        error: { code: 'ORG_ACCESS_DENIED', message: 'You do not have access to this organization', requestId: req.requestId }
      });
      return;
    }
    (req as any).organizationId = orgId;
  }

  next();
}

/**
 * Global error handler.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'production' ? 'An internal error occurred' : err.message,
      requestId: req.requestId,
    }
  });
}

/**
 * Audit logging helper.
 */
export function auditLog(userId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>, ipAddress?: string): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, metadata, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(generateId(), userId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null, ipAddress || null);
}
