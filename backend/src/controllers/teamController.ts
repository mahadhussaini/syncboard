import { Request, Response } from 'express';
import { z } from 'zod';
import teamService from '@/services/teamService';
import invitationService from '@/services/invitationService';
import userService from '@/services/userService';
import logger from '@/utils/logger';
import {
  createTeamSchema,
  updateTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '@/validation/teamSchemas';

export async function createTeam(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createTeamSchema.parse(req.body);
    const userId = req.user?.id as string;

    const team = await teamService.createTeam({
      ...parsed,
      ownerId: userId,
    });

    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    logger.error('Failed to create team:', error);
    res.status(500).json({ success: false, error: 'Failed to create team' });
  }
}

export async function getTeams(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const teams = await teamService.getUserTeams(userId);

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    logger.error('Failed to get teams:', error);
    res.status(500).json({ success: false, error: 'Failed to get teams' });
  }
}

export async function getTeam(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.id;
    const userId = req.user?.id as string;

    const hasAccess = await teamService.isMember(teamId, userId);
    if (!hasAccess) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const team = await teamService.getTeamById(teamId);
    if (!team) {
      res.status(404).json({ success: false, error: 'Team not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    logger.error('Failed to get team:', error);
    res.status(500).json({ success: false, error: 'Failed to get team' });
  }
}

export async function updateTeam(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = updateTeamSchema.parse(req.body);

    const hasPermission = await teamService.hasPermission(teamId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const team = await teamService.updateTeam(teamId, parsed);

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    logger.error('Failed to update team:', error);
    res.status(500).json({ success: false, error: 'Failed to update team' });
  }
}

export async function deleteTeam(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.id;
    const userId = req.user?.id as string;

    const hasPermission = await teamService.hasPermission(teamId, userId, 'OWNER');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Only team owners can delete teams' });
      return;
    }

    await teamService.deleteTeam(teamId);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete team:', error);
    res.status(500).json({ success: false, error: 'Failed to delete team' });
  }
}

export async function inviteMember(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = inviteMemberSchema.parse(req.body);

    const hasPermission = await teamService.hasPermission(teamId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(parsed.email);
    if (existingUser) {
      const isMember = await teamService.isMember(teamId, existingUser.id);
      if (isMember) {
        res.status(400).json({ success: false, error: 'User is already a team member' });
        return;
      }
    }

    const invitationId = await invitationService.createInvitation({
      email: parsed.email,
      role: parsed.role,
      invitedBy: userId,
      teamId,
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
    logger.error('Failed to invite member:', error);
    res.status(500).json({ success: false, error: 'Failed to invite member' });
  }
}

export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.user?.id as string;
    const parsed = updateMemberRoleSchema.parse(req.body);

    const hasPermission = await teamService.hasPermission(teamId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const member = await teamService.updateMemberRole(teamId, memberId, parsed.role);

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    logger.error('Failed to update member role:', error);
    res.status(500).json({ success: false, error: 'Failed to update member role' });
  }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const teamId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.user?.id as string;

    const hasPermission = await teamService.hasPermission(teamId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    // Prevent removing the team owner
    const memberRole = await teamService.getMemberRole(teamId, memberId);
    if (memberRole === 'OWNER') {
      res.status(400).json({ success: false, error: 'Cannot remove team owner' });
      return;
    }

    await teamService.removeMember(teamId, memberId);

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    logger.error('Failed to remove member:', error);
    res.status(500).json({ success: false, error: 'Failed to remove member' });
  }
} 