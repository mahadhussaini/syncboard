import { Request, Response } from 'express';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';

export async function getUserNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await notificationService.getUserNotifications(userId, limit, offset);
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          limit,
          offset,
          hasMore: notifications.length === limit,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get user notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to get notifications' });
  }
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error('Failed to mark notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
}

export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;

    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Failed to mark all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;

    const unreadCount = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    logger.error('Failed to get unread count:', error);
    res.status(500).json({ success: false, error: 'Failed to get unread count' });
  }
} 