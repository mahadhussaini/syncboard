import { Request, Response } from 'express';
import upload from '@/middleware/upload';
import attachmentService from '@/services/attachmentService';
import itemService from '@/services/itemService';
import workspaceService from '@/services/workspaceService';
import logger from '@/utils/logger';

export const uploadItemAttachmentMiddleware = upload.single('file');

export async function uploadItemAttachment(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const itemId = req.params.itemId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }

    const item = await itemService.getItemById(itemId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Item not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(item.column.board.workspaceId, userId, 'MEMBER');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const attachment = await attachmentService.addAttachmentToItem(itemId, userId, file);
    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    logger.error('Failed to upload attachment:', error);
    res.status(500).json({ success: false, error: 'Failed to upload attachment' });
  }
}

export async function listItemAttachments(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const itemId = req.params.itemId;

    const item = await itemService.getItemById(itemId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Item not found' });
      return;
    }

    const isMember = await workspaceService.isMember(item.column.board.workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const attachments = await attachmentService.getItemAttachments(itemId);
    res.status(200).json({ success: true, data: attachments });
  } catch (error) {
    logger.error('Failed to list attachments:', error);
    res.status(500).json({ success: false, error: 'Failed to list attachments' });
  }
}

export async function deleteAttachment(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const attachmentId = req.params.id;

    const attachment = await attachmentService.deleteAttachment(attachmentId);
    if (!attachment) {
      res.status(404).json({ success: false, error: 'Attachment not found' });
      return;
    }

    // Verify permission on the related item -> workspace
    const item = await itemService.getItemById(attachment.itemId as string);
    if (!item) {
      res.status(404).json({ success: false, error: 'Related item not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(item.column.board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    res.status(200).json({ success: true, message: 'Attachment deleted' });
  } catch (error) {
    logger.error('Failed to delete attachment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete attachment' });
  }
}