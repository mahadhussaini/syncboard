import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { serverConfig } from '@/config';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, error: 'Not Found' });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || err.code || 500;
  const message = err.message || 'Internal Server Error';

  logger.logError(err, req);

  res.status(Number(status)).json({
    success: false,
    error: message,
    ...(serverConfig.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
}