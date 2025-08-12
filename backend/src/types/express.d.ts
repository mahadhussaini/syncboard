import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
        teamId?: string;
        workspaceId?: string;
      };
      token?: string;
    }
  }
}

export {};