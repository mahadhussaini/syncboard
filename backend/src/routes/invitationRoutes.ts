import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  acceptInvitation,
  declineInvitation,
  resendInvitation,
  getInvitation,
  getPendingInvitations,
} from '@/controllers/invitationController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Invitation management
router.post('/accept', acceptInvitation);
router.post('/decline', declineInvitation);
router.post('/resend', resendInvitation);
router.get('/pending', getPendingInvitations);
router.get('/:id', getInvitation);

export default router; 