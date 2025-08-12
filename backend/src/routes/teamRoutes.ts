import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '@/controllers/teamController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Team CRUD operations
router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Team member management
router.post('/:id/invite', inviteMember);
router.put('/:id/members/:memberId/role', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

export default router; 