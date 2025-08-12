import { Request, Response, NextFunction } from 'express';
import tokenService from '@/services/tokenService';

const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Missing authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = tokenService.verifyAccessToken(token);

    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      role: (payload.role as any) || 'MEMBER',
    };

    next();
  } catch (_error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = tokenService.verifyAccessToken(token);

    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      role: (payload.role as any) || 'MEMBER',
    };
  } catch {
    // ignore
  } finally {
    next();
  }
}

export function requireRole(requiredRole: 'VIEWER' | 'MEMBER' | 'ADMIN' | 'OWNER') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role ?? 'VIEWER';
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? Number.POSITIVE_INFINITY;

    if (userLevel >= requiredLevel) return next();

    res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
  };
}