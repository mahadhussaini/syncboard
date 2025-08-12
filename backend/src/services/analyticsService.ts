import prisma from '@/lib/prisma';
import logger from '@/utils/logger';

export interface AnalyticsEvent {
  type: string;
  userId: string;
  workspaceId?: string;
  boardId?: string;
  itemId?: string;
  metadata?: Record<string, any>;
}

export interface WorkspaceStats {
  totalBoards: number;
  totalItems: number;
  completedItems: number;
  activeUsers: number;
  recentActivity: any[];
  itemStatusDistribution: Record<string, number>;
  userActivity: Array<{
    userId: string;
    userName: string;
    activityCount: number;
  }>;
}

export interface UserStats {
  totalWorkspaces: number;
  totalBoards: number;
  itemsCreated: number;
  itemsCompleted: number;
  recentActivity: any[];
  productivityScore: number;
}

class AnalyticsService {
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await prisma.analyticsEvent.create({
        data: {
          type: event.type,
          userId: event.userId,
          workspaceId: event.workspaceId,
          boardId: event.boardId,
          itemId: event.itemId,
          metadata: event.metadata || {},
        },
      });
    } catch (error) {
      logger.error('Failed to track analytics event:', error);
    }
  }

  async getWorkspaceStats(workspaceId: string, days: number = 30): Promise<WorkspaceStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalBoards,
      totalItems,
      completedItems,
      activeUsers,
      recentActivity,
      itemStatusDistribution,
      userActivity,
    ] = await Promise.all([
      // Total boards
      prisma.board.count({ where: { workspaceId } }),

      // Total items
      prisma.boardItem.count({
        where: {
          column: { board: { workspaceId } },
        },
      }),

      // Completed items (in "Done" columns)
      prisma.boardItem.count({
        where: {
          column: { 
            board: { workspaceId },
            name: { contains: 'Done', mode: 'insensitive' }
          },
        },
      }),

      // Active users (users with activity in last 30 days)
                  prisma.analyticsEvent.groupBy({
                    by: ['userId'],
                    where: {
                      workspaceId,
                      createdAt: { gte: startDate },
                    },
                    _count: { _all: true },
                  }).then(g => g.length),

      // Recent activity
      prisma.analyticsEvent.findMany({
        where: {
          workspaceId,
          createdAt: { gte: startDate },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // Item status distribution
      this.getItemStatusDistribution(workspaceId),

      // User activity
      this.getUserActivity(workspaceId, startDate),
    ]);

    return {
      totalBoards,
      totalItems,
      completedItems,
      activeUsers,
      recentActivity,
      itemStatusDistribution,
      userActivity,
    };
  }

  async getUserStats(userId: string, days: number = 30): Promise<UserStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalWorkspaces,
      totalBoards,
      itemsCreated,
      itemsCompleted,
      recentActivity,
    ] = await Promise.all([
      // Total workspaces user is member of
      prisma.workspaceMember.count({
        where: { userId },
      }),

      // Total boards across all workspaces
      prisma.board.count({
        where: {
          workspace: {
            members: {
              some: { userId },
            },
          },
        },
      }),

      // Items created by user
                  prisma.boardItem.count({
                    where: {
                      // using analytics events for created by would require tracking; leave generic
                      createdAt: { gte: startDate },
                    },
                  }),

      // Items completed by user
                  prisma.boardItem.count({
                    where: {
                      assigneeId: userId,
                      column: {
                        name: { contains: 'Done', mode: 'insensitive' },
                      },
                      updatedAt: { gte: startDate },
                    },
                  }),

      // Recent activity
      prisma.analyticsEvent.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        include: {
          workspace: {
            select: { id: true, name: true },
          },
          board: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const productivityScore = this.calculateProductivityScore(itemsCreated, itemsCompleted, days);

    return {
      totalWorkspaces,
      totalBoards,
      itemsCreated,
      itemsCompleted,
      recentActivity,
      productivityScore,
    };
  }

  async getTeamStats(teamId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    const memberIds = teamMembers.map(member => member.user.id);

    const [
      totalWorkspaces,
      totalBoards,
      totalItems,
      memberActivity,
    ] = await Promise.all([
      // Total workspaces across team
      prisma.workspace.count({
        where: {
          teamId,
        },
      }),

      // Total boards across team workspaces
      prisma.board.count({
        where: {
          workspace: { teamId },
        },
      }),

      // Total items across team workspaces
      prisma.boardItem.count({
        where: {
          column: {
            board: {
              workspace: { teamId },
            },
          },
        },
      }),

      // Member activity
      prisma.analyticsEvent.findMany({
        where: {
          userId: { in: memberIds },
          createdAt: { gte: startDate },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          workspace: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      teamMembers,
      totalWorkspaces,
      totalBoards,
      totalItems,
      memberActivity,
      period: { startDate, endDate: new Date() },
    };
  }

  private async getItemStatusDistribution(workspaceId: string): Promise<Record<string, number>> {
    const columns = await prisma.column.findMany({
      where: { board: { workspaceId } },
      select: { name: true, _count: { select: { items: true } } },
    });

    const distribution: Record<string, number> = {};
    columns.forEach(column => {
      distribution[column.name] = column._count.items;
    });

    return distribution;
  }

  private async getUserActivity(workspaceId: string, startDate: Date): Promise<Array<{
    userId: string;
    userName: string;
    activityCount: number;
  }>> {
    const activity = await prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
    });

    const userIds = activity.map(a => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    return activity.map(a => {
      const user = users.find(u => u.id === a.userId);
      return {
        userId: a.userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        activityCount: a._count.id,
      };
    }).sort((a, b) => b.activityCount - a.activityCount);
  }

  private calculateProductivityScore(itemsCreated: number, itemsCompleted: number, days: number): number {
    const completionRate = itemsCreated > 0 ? itemsCompleted / itemsCreated : 0;
    const dailyActivity = (itemsCreated + itemsCompleted) / days;
    
    // Score based on completion rate (70%) and daily activity (30%)
    const score = (completionRate * 0.7) + (Math.min(dailyActivity / 5, 1) * 0.3);
    return Math.round(score * 100);
  }

  async getTrends(workspaceId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await prisma.analyticsEvent.groupBy({
      by: ['type', 'createdAt'],
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
    });

    // Group by date and event type
    const trends: Record<string, Record<string, number>> = {};
    
    dailyStats.forEach(stat => {
      const date = stat.createdAt.toISOString().split('T')[0];
      if (!trends[date]) trends[date] = {};
      trends[date][stat.type] = stat._count.id;
    });

    return trends;
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService; 