import { Request, Response } from 'express';
import { z } from 'zod';
import workspaceService from '@/services/workspaceService';
import teamService from '@/services/teamService';
import invitationService from '@/services/invitationService';
import userService from '@/services/userService';
import logger from '@/utils/logger';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
} from '@/validation/teamSchemas';

export async function createWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.teamId;
    const userId = req.user?.id as string;
    const parsed = createWorkspaceSchema.parse(req.body);

    // Check if user has access to the team
    const hasTeamAccess = await teamService.isMember(teamId, userId);
    if (!hasTeamAccess) {
      res.status(403).json({ success: false, error: 'Access denied to team' });
      return;
    }

    const workspace = await workspaceService.createWorkspace({
      ...parsed,
      teamId,
      ownerId: userId,
    });

    res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    logger.error('Failed to create workspace:', error);
    res.status(500).json({ success: false, error: 'Failed to create workspace' });
  }
}

export async function getWorkspaces(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const workspaces = await workspaceService.getUserWorkspaces(userId);

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    logger.error('Failed to get workspaces:', error);
    res.status(500).json({ success: false, error: 'Failed to get workspaces' });
  }
}

export async function getTeamWorkspaces(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.teamId;
    const userId = req.user?.id as string;

    const hasTeamAccess = await teamService.isMember(teamId, userId);
    if (!hasTeamAccess) {
      res.status(403).json({ success: false, error: 'Access denied to team' });
      return;
    }

    const workspaces = await workspaceService.getTeamWorkspaces(teamId);

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    logger.error('Failed to get team workspaces:', error);
    res.status(500).json({ success: false, error: 'Failed to get team workspaces' });
  }
}

export async function getWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.id as string;

    const hasAccess = await workspaceService.isMember(workspaceId, userId);
    if (!hasAccess) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      res.status(404).json({ success: false, error: 'Workspace not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    logger.error('Failed to get workspace:', error);
    res.status(500).json({ success: false, error: 'Failed to get workspace' });
  }
}

export async function updateWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = updateWorkspaceSchema.parse(req.body);

    const hasPermission = await workspaceService.hasPermission(workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const workspace = await workspaceService.updateWorkspace(workspaceId, parsed);

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    logger.error('Failed to update workspace:', error);
    res.status(500).json({ success: false, error: 'Failed to update workspace' });
  }
}

export async function deleteWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.id as string;

    const hasPermission = await workspaceService.hasPermission(workspaceId, userId, 'OWNER');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Only workspace owners can delete workspaces' });
      return;
    }

    await workspaceService.deleteWorkspace(workspaceId);

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete workspace:', error);
    res.status(500).json({ success: false, error: 'Failed to delete workspace' });
  }
}

export async function inviteWorkspaceMember(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = inviteWorkspaceMemberSchema.parse(req.body);

    const hasPermission = await workspaceService.hasPermission(workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(parsed.email);
    if (existingUser) {
      const isMember = await workspaceService.isMember(workspaceId, existingUser.id);
      if (isMember) {
        res.status(400).json({ success: false, error: 'User is already a workspace member' });
        return;
      }
    }

    const invitationId = await invitationService.createInvitation({
      email: parsed.email,
      role: parsed.role,
      invitedBy: userId,
      workspaceId,
      message: parsed.message,
    });

    res.status(201).json({
      success: true,
      data: {
        invitationId,
        email: parsed.email,
        role: parsed.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    logger.error('Failed to invite workspace member:', error);
    res.status(500).json({ success: false, error: 'Failed to invite workspace member' });
  }
}

export async function updateWorkspaceMemberRole(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.user?.id as string;
    const parsed = updateWorkspaceMemberRoleSchema.parse(req.body);

    const hasPermission = await workspaceService.hasPermission(workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const member = await workspaceService.updateMemberRole(workspaceId, memberId, parsed.role);

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    logger.error('Failed to update workspace member role:', error);
    res.status(500).json({ success: false, error: 'Failed to update workspace member role' });
  }
}

export async function removeWorkspaceMember(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.user?.id as string;

    const hasPermission = await workspaceService.hasPermission(workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    // Prevent removing the workspace owner
    const memberRole = await workspaceService.getMemberRole(workspaceId, memberId);
    if (memberRole === 'OWNER') {
      res.status(400).json({ success: false, error: 'Cannot remove workspace owner' });
      return;
    }

    await workspaceService.removeMember(workspaceId, memberId);

    res.status(200).json({
      success: true,
      message: 'Workspace member removed successfully',
    });
  } catch (error) {
    logger.error('Failed to remove workspace member:', error);
    res.status(500).json({ success: false, error: 'Failed to remove workspace member' });
  }
}

export async function getWorkspaceTemplates(req: Request, res: Response): Promise<void> {
  try {
    const templates = workspaceService.getTemplates();

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('Failed to get workspace templates:', error);
    res.status(500).json({ success: false, error: 'Failed to get workspace templates' });
  }
}

export async function getWorkspaceTemplate(req: Request, res: Response): Promise<void> {
  try {
    const templateId = req.params.templateId;
    const template = workspaceService.getTemplate(templateId);

    if (!template) {
      res.status(404).json({ success: false, error: 'Template not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error('Failed to get workspace template:', error);
    res.status(500).json({ success: false, error: 'Failed to get workspace template' });
  }
} 