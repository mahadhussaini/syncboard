import { Request, Response } from 'express';
import { z } from 'zod';
import invitationService from '@/services/invitationService';
import logger from '@/utils/logger';
import { acceptInvitationSchema, resendInvitationSchema } from '@/validation/teamSchemas';

export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const parsed = acceptInvitationSchema.parse(req.body);

    const success = await invitationService.acceptInvitation(parsed.invitationId, userId);

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e: any) => e.message).join(', ') });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    logger.error('Failed to accept invitation:', error);
    res.status(500).json({ success: false, error: 'Failed to accept invitation' });
  }
}

export async function declineInvitation(req: Request, res: Response): Promise<void> {
  try {
    const parsed = acceptInvitationSchema.parse(req.body);

    await invitationService.declineInvitation(parsed.invitationId);

    res.status(200).json({
      success: true,
      message: 'Invitation declined successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e: any) => e.message).join(', ') });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    logger.error('Failed to decline invitation:', error);
    res.status(500).json({ success: false, error: 'Failed to decline invitation' });
  }
}

export async function resendInvitation(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const parsed = resendInvitationSchema.parse(req.body);

    // Validate that user has permission to resend this invitation
    const hasAccess = await invitationService.validateInvitationAccess(parsed.invitationId, userId);
    if (!hasAccess) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const newInvitationId = await invitationService.resendInvitation(parsed.invitationId, userId);

    res.status(200).json({
      success: true,
      data: {
        invitationId: newInvitationId,
      },
      message: 'Invitation resent successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e: any) => e.message).join(', ') });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    logger.error('Failed to resend invitation:', error);
    res.status(500).json({ success: false, error: 'Failed to resend invitation' });
  }
}

export async function getInvitation(req: Request, res: Response): Promise<void> {
  try {
    const invitationId = req.params.id;
    const invitation = await invitationService.getInvitation(invitationId);

    if (!invitation) {
      res.status(404).json({ success: false, error: 'Invitation not found or expired' });
      return;
    }

    res.status(200).json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    logger.error('Failed to get invitation:', error);
    res.status(500).json({ success: false, error: 'Failed to get invitation' });
  }
}

export async function getPendingInvitations(req: Request, res: Response): Promise<void> {
  try {
    const userEmail = req.user?.email as string;
    const invitations = await invitationService.getPendingInvitations(userEmail);

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    logger.error('Failed to get pending invitations:', error);
    res.status(500).json({ success: false, error: 'Failed to get pending invitations' });
  }
} 