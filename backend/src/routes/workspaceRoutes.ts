import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  createWorkspace,
  getWorkspaces,
  getTeamWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  getWorkspaceTemplates,
  getWorkspaceTemplate,
} from '@/controllers/workspaceController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Workspace templates (public)
router.get('/templates', getWorkspaceTemplates);
router.get('/templates/:templateId', getWorkspaceTemplate);

// Workspace CRUD operations
router.get('/', getWorkspaces);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

// Team workspaces
router.get('/team/:teamId', getTeamWorkspaces);
router.post('/team/:teamId', createWorkspace);

// Workspace member management
router.post('/:id/invite', inviteWorkspaceMember);
router.put('/:id/members/:memberId/role', updateWorkspaceMemberRole);
router.delete('/:id/members/:memberId', removeWorkspaceMember);

export default router; 