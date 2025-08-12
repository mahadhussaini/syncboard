import prisma from '@/lib/prisma';

type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface CreateTeamInput {
  name: string;
  description?: string;
  avatar?: string;
  ownerId: string;
}

export interface InviteMemberInput {
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
}

class TeamService {
  async createTeam(input: CreateTeamInput) {
    return prisma.team.create({
      data: {
        name: input.name,
        description: input.description,
        avatar: input.avatar,
        ownerId: input.ownerId,
        members: {
          create: {
            userId: input.ownerId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            workspaces: true,
            members: true,
          },
        },
      },
    });
  }

  async getTeamById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        workspaces: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            workspaces: true,
            members: true,
          },
        },
      },
    });
  }

  async getUserTeams(userId: string) {
    return prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            workspaces: true,
            members: true,
          },
        },
      },
    });
  }

  async updateTeam(id: string, data: Partial<{ name: string; description: string; avatar: string }>) {
    return prisma.team.update({
      where: { id },
      data,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteTeam(id: string) {
    return prisma.team.delete({
      where: { id },
    });
  }

  async addMember(teamId: string, userId: string, role: TeamRole = 'MEMBER') {
    return prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateMemberRole(teamId: string, userId: string, role: TeamRole) {
    return prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });
  }

  async getMemberRole(teamId: string, userId: string): Promise<TeamRole | null> {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      select: { role: true },
    });
    return (member?.role as TeamRole) || null;
  }

  async isMember(teamId: string, userId: string): Promise<boolean> {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });
    return !!member;
  }

  async hasPermission(teamId: string, userId: string, requiredRole: TeamRole): Promise<boolean> {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      select: { role: true },
    });

    if (!member) return false;

    const roleHierarchy: Record<TeamRole, number> = {
      OWNER: 4,
      ADMIN: 3,
      MEMBER: 2,
      VIEWER: 1,
    };

    return roleHierarchy[member.role as TeamRole] >= roleHierarchy[requiredRole];
  }
}

const teamService = new TeamService();
export default teamService; 