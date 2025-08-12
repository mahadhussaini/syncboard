import { Request, Response } from 'express';
import analyticsService from '@/services/analyticsService';
import workspaceService from '@/services/workspaceService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';

export async function getWorkspaceStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const workspaceId = req.params.workspaceId;
    const days = parseInt(req.query.days as string) || 30;

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const stats = await analyticsService.getWorkspaceStats(workspaceId, days);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to get workspace stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get workspace statistics' });
  }
}

export async function getUserStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const days = parseInt(req.query.days as string) || 30;

    const stats = await analyticsService.getUserStats(userId, days);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to get user stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get user statistics' });
  }
}

export async function getTeamStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const teamId = req.params.teamId;
    const days = parseInt(req.query.days as string) || 30;

    const hasPermission = await teamService.hasPermission(teamId, userId, 'MEMBER');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const stats = await analyticsService.getTeamStats(teamId, days);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to get team stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get team statistics' });
  }
}

export async function getWorkspaceTrends(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const workspaceId = req.params.workspaceId;
    const days = parseInt(req.query.days as string) || 30;

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const trends = await analyticsService.getTrends(workspaceId, days);
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    logger.error('Failed to get workspace trends:', error);
    res.status(500).json({ success: false, error: 'Failed to get workspace trends' });
  }
}

export async function trackEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const { type, workspaceId, boardId, itemId, metadata } = req.body;

    if (!type) {
      res.status(400).json({ success: false, error: 'Event type is required' });
      return;
    }

    // If workspaceId is provided, verify access
    if (workspaceId) {
      const isMember = await workspaceService.isMember(workspaceId, userId);
      if (!isMember) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
    }

    await analyticsService.trackEvent({
      type,
      userId,
      workspaceId,
      boardId,
      itemId,
      metadata,
    });

    res.status(200).json({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    logger.error('Failed to track event:', error);
    res.status(500).json({ success: false, error: 'Failed to track event' });
  }
} 