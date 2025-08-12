import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '@/controllers/notificationController';

const router = Router();

router.use(authenticate);

// Get user notifications with pagination
router.get('/', getUserNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark specific notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllNotificationsAsRead);

export default router; 