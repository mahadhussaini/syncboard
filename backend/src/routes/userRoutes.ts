import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { getProfile, updateProfile, changePassword } from '@/controllers/userController';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;