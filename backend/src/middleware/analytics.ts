import { Request, Response, NextFunction } from 'express';
import analyticsService from '@/services/analyticsService';

export function trackEvent(eventType: string, getMetadata?: (req: Request, res: Response) => Record<string, any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const onFinish = () => {
      res.removeListener('finish', onFinish);
      if (!userId) return;
      const metadata = getMetadata ? getMetadata(req, res) : {};
      analyticsService
        .trackEvent({
          type: eventType,
          userId,
          workspaceId: req.params['workspaceId'],
          boardId: req.params['boardId'],
          itemId: req.params['itemId'],
          metadata,
        })
        .catch(() => {});
    };

    res.on('finish', onFinish);
    next();
  };
}

// Common event tracking middleware
export const trackBoardCreated = trackEvent('BOARD_CREATED');
export const trackBoardUpdated = trackEvent('BOARD_UPDATED');
export const trackBoardDeleted = trackEvent('BOARD_DELETED');
export const trackColumnCreated = trackEvent('COLUMN_CREATED');
export const trackColumnUpdated = trackEvent('COLUMN_UPDATED');
export const trackColumnDeleted = trackEvent('COLUMN_DELETED');
export const trackItemCreated = trackEvent('ITEM_CREATED');
export const trackItemUpdated = trackEvent('ITEM_UPDATED');
export const trackItemDeleted = trackEvent('ITEM_DELETED');
export const trackItemMoved = trackEvent('ITEM_MOVED');
export const trackWorkspaceJoined = trackEvent('WORKSPACE_JOINED');
export const trackWorkspaceLeft = trackEvent('WORKSPACE_LEFT');
export const trackFileUploaded = trackEvent('FILE_UPLOADED');
export const trackAIAssistantUsed = trackEvent('AI_ASSISTANT_USED'); 