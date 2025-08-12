import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import authLimiter from '@/middleware/rateLimit';
import {
  register,
  login,
  me,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from '@/controllers/authController';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', authLimiter, logout);
router.get('/me', authenticate, me);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;