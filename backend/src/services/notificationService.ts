import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import logger from '@/utils/logger';

type NotificationType = 'TASK_ASSIGNED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'TEAM_INVITE' | 'WORKSPACE_INVITE' | 'MENTION' | 'SYSTEM';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

class NotificationService {
  async createNotification(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type as any,
        title: input.title,
        message: input.message,
        data: input.data || {},
      },
    });

    await this.publishNotification(notification);
    return notification;
  }

  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async publishNotification(notification: any) {
    try {
      await redis.publish(
        `notifications:${notification.userId}`,
        JSON.stringify(notification)
      );
    } catch (error) {
      logger.error('Failed to publish notification:', error);
    }
  }

  async notifyTaskAssigned(userId: string, taskTitle: string, assignerName: string) {
    return this.createNotification({
      userId,
      type: 'TASK_ASSIGNED',
      title: 'Task Assigned',
      message: `${assignerName} assigned you the task: "${taskTitle}"`,
      data: { taskTitle, assignerName },
    });
  }

  async notifyMention(userId: string, mentionedBy: string, context: string) {
    return this.createNotification({
      userId,
      type: 'MENTION',
      title: 'You were mentioned',
      message: `${mentionedBy} mentioned you: "${context}"`,
      data: { mentionedBy, context },
    });
  }
}

const notificationService = new NotificationService();
export default notificationService; 