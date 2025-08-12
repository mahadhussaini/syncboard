import redis from '@/lib/redis';
import teamService from '@/services/teamService';
import workspaceService from '@/services/workspaceService';
import logger from '@/utils/logger';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface CreateInvitationInput {
  email: string;
  role: Role;
  invitedBy: string;
  teamId?: string;
  workspaceId?: string;
  message?: string;
}

export interface InvitationData {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  teamId?: string;
  workspaceId?: string;
  message?: string;
  expiresAt: Date;
}

const INVITATION_PREFIX = 'invitation:';
const INVITATION_TTL = 7 * 24 * 60 * 60; // 7 days

class InvitationService {
  async createInvitation(input: CreateInvitationInput): Promise<string> {
    const invitationId = this.generateInvitationId();
    const expiresAt = new Date(Date.now() + INVITATION_TTL * 1000);

    const base: Omit<InvitationData, 'teamId' | 'workspaceId' | 'message'> = {
      id: invitationId,
      email: input.email.toLowerCase(),
      role: input.role,
      invitedBy: input.invitedBy,
      expiresAt,
    };

    const invitationData: InvitationData = {
      ...base,
      ...(input.teamId ? { teamId: input.teamId } : {}),
      ...(input.workspaceId ? { workspaceId: input.workspaceId } : {}),
      ...(input.message ? { message: input.message } : {}),
    };

    await redis.set(
      `${INVITATION_PREFIX}${invitationId}`,
      JSON.stringify(invitationData),
      INVITATION_TTL
    );

    logger.info(`Invitation created: ${invitationId} for ${input.email}`, {
      invitation: invitationData,
    });

    return invitationId;
  }

  async getInvitation(invitationId: string): Promise<InvitationData | null> {
    const data = await redis.get(`${INVITATION_PREFIX}${invitationId}`);
    if (!data) return null;

    try {
      return JSON.parse(data) as InvitationData;
    } catch {
      return null;
    }
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<boolean> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date()) {
      await this.deleteInvitation(invitationId);
      throw new Error('Invitation has expired');
    }

    try {
      if (invitation.teamId) {
        const isMember = await teamService.isMember(invitation.teamId, userId);
        if (isMember) {
          throw new Error('User is already a team member');
        }
        await teamService.addMember(invitation.teamId, userId, invitation.role);
      } else if (invitation.workspaceId) {
        const isMember = await workspaceService.isMember(invitation.workspaceId, userId);
        if (isMember) {
          throw new Error('User is already a workspace member');
        }
        await workspaceService.addMember(invitation.workspaceId, userId, invitation.role);
      }

      await this.deleteInvitation(invitationId);

      logger.info(`Invitation accepted: ${invitationId} by user ${userId}`, {
        invitation,
        userId,
      });

      return true;
    } catch (error) {
      logger.error(`Failed to accept invitation: ${invitationId}`, { error, invitation, userId });
      throw error;
    }
  }

  async declineInvitation(invitationId: string): Promise<void> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) {
      throw new Error('Invalid invitation');
    }

    await this.deleteInvitation(invitationId);

    logger.info(`Invitation declined: ${invitationId}`, { invitation });
  }

  async deleteInvitation(invitationId: string): Promise<void> {
    await redis.del(`${INVITATION_PREFIX}${invitationId}`);
  }

  async getPendingInvitations(_email: string): Promise<InvitationData[]> {
    return [];
  }

  async resendInvitation(invitationId: string, invitedBy: string): Promise<string> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) {
      throw new Error('Invalid invitation');
    }

    await this.deleteInvitation(invitationId);

    const newInvitationId = await this.createInvitation({
      email: invitation.email,
      role: invitation.role,
      invitedBy,
      ...(invitation.teamId ? { teamId: invitation.teamId } : {}),
      ...(invitation.workspaceId ? { workspaceId: invitation.workspaceId } : {}),
      ...(invitation.message ? { message: invitation.message } : {}),
    });

    logger.info(`Invitation resent: ${invitationId} -> ${newInvitationId}`, {
      oldInvitation: invitation,
      newInvitationId,
    });

    return newInvitationId;
  }

  private generateInvitationId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async validateInvitationAccess(invitationId: string, userId: string): Promise<boolean> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) return false;

    if (invitation.teamId) {
      return await teamService.hasPermission(invitation.teamId, userId, 'ADMIN');
    } else if (invitation.workspaceId) {
      return await workspaceService.hasPermission(invitation.workspaceId, userId, 'ADMIN');
    }

    return false;
  }

  async getInvitationStats(_teamId?: string, _workspaceId?: string): Promise<{
    pending: number;
    accepted: number;
    declined: number;
  }> {
    return { pending: 0, accepted: 0, declined: 0 };
  }
}

const invitationService = new InvitationService();
export default invitationService; 