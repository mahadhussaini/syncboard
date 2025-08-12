import { Request, Response } from 'express';
import { z } from 'zod';
import aiService from '@/services/aiService';
import workspaceService from '@/services/workspaceService';
import logger from '@/utils/logger';
import {
  aiRequestSchema,
  taskSuggestionSchema,
  meetingSummarySchema,
  timelineGenerationSchema,
  codeReviewSchema,
} from '@/validation/aiSchemas';

export async function processAIRequest(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;
    const parsed = aiRequestSchema.parse(req.body);

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const response = await aiService.processAIRequest({
      ...parsed,
      workspaceId,
      userId,
    });

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('AI request processing failed:', error);
    res.status(500).json({ success: false, error: 'Failed to process AI request' });
  }
}

export async function suggestTasks(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;
    const parsed = taskSuggestionSchema.parse(req.body);

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const response = await aiService.suggestTasks(workspaceId, parsed.context);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Task suggestion failed:', error);
    res.status(500).json({ success: false, error: 'Failed to suggest tasks' });
  }
}

export async function summarizeMeeting(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;
    const parsed = meetingSummarySchema.parse(req.body);

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const response = await aiService.summarizeMeeting(parsed.transcript, parsed.participants);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Meeting summarization failed:', error);
    res.status(500).json({ success: false, error: 'Failed to summarize meeting' });
  }
}

export async function generateTimeline(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;
    const parsed = timelineGenerationSchema.parse(req.body);

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const response = await aiService.generateTimeline(parsed.projectContext, parsed.milestones);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Timeline generation failed:', error);
    res.status(500).json({ success: false, error: 'Failed to generate timeline' });
  }
}

export async function reviewCode(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;
    const parsed = codeReviewSchema.parse(req.body);

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const response = await aiService.reviewCode(parsed.code, parsed.language, parsed.context);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Code review failed:', error);
    res.status(500).json({ success: false, error: 'Failed to review code' });
  }
}

export async function getAIHistory(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;
    const limit = parseInt(req.query.limit as string) || 50;

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const history = await aiService.getRequestHistory(workspaceId, limit);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    logger.error('Failed to get AI history:', error);
    res.status(500).json({ success: false, error: 'Failed to get AI history' });
  }
} 