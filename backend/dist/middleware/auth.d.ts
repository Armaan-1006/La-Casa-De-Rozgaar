import { Request, Response, NextFunction } from 'express';
import type { AuthTokenPayload, UserRole } from '../types.js';
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
export declare function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void;
/**
 * Authenticate via Bearer token.
 */
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
/**
 * Authorization: require specific roles.
 */
export declare function authorize(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Verify organization membership (for employer endpoints).
 */
export declare function requireOrganization(req: Request, res: Response, next: NextFunction): void;
/**
 * Global error handler.
 */
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
/**
 * Audit logging helper.
 */
export declare function auditLog(userId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>, ipAddress?: string): void;
//# sourceMappingURL=auth.d.ts.map