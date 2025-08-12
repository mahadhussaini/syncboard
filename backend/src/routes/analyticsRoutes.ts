import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  getWorkspaceStats,
  getUserStats,
  getTeamStats,
  getWorkspaceTrends,
  trackEvent,
} from '@/controllers/analyticsController';

const router = Router();

router.use(authenticate);

// Workspace analytics
router.get('/workspace/:workspaceId/stats', getWorkspaceStats);
router.get('/workspace/:workspaceId/trends', getWorkspaceTrends);

// User analytics
router.get('/user/stats', getUserStats);

// Team analytics
router.get('/team/:teamId/stats', getTeamStats);

// Event tracking
router.post('/events', trackEvent);

export default router; 