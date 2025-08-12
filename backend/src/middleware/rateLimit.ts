import rateLimit from 'express-rate-limit';
import { serverConfig } from '@/config';

export const authLimiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
});

export default authLimiter;