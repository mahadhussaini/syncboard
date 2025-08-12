import prisma from '@/lib/prisma';

type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type WorkspaceType = 'KANBAN' | 'WHITEBOARD' | 'NOTES' | 'TIMELINE' | 'CUSTOM';

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  type: WorkspaceType;
  teamId: string;
  ownerId: string;
  template?: string;
}

export interface WorkspaceTemplate {
  name: string;
  type: WorkspaceType;
  description: string;
  columns?: Array<{
    name: string;
    order: number;
  }>;
}

const WORKSPACE_TEMPLATES: Record<string, WorkspaceTemplate> = {
  'kanban': {
    name: 'Kanban Board',
    type: 'KANBAN',
    description: 'Track tasks through different stages',
    columns: [
      { name: 'To Do', order: 1 },
      { name: 'In Progress', order: 2 },
      { name: 'Review', order: 3 },
      { name: 'Done', order: 4 },
    ],
  },
  'brainstorming': {
    name: 'Brainstorming Session',
    type: 'WHITEBOARD',
    description: 'Collaborative idea generation',
  },
  'project': {
    name: 'Project Management',
    type: 'KANBAN',
    description: 'Full project lifecycle management',
    columns: [
      { name: 'Backlog', order: 1 },
      { name: 'Planning', order: 2 },
      { name: 'Development', order: 3 },
      { name: 'Testing', order: 4 },
      { name: 'Deployment', order: 5 },
    ],
  },
  'meeting': {
    name: 'Meeting Notes',
    type: 'NOTES',
    description: 'Collaborative meeting documentation',
  },
};

class WorkspaceService {
  async createWorkspace(input: CreateWorkspaceInput) {
    const template = input.template ? WORKSPACE_TEMPLATES[input.template] : null;

    return prisma.workspace.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
        teamId: input.teamId,
        ownerId: input.ownerId,
        members: {
          create: {
            userId: input.ownerId,
            role: 'OWNER',
          },
        },
        ...(template?.columns && {
          boards: {
            create: {
              name: template.name,
              type: template.type as any,
              columns: {
                create: template.columns.map((col) => ({
                  name: col.name,
                  order: col.order,
                })),
              },
            },
          },
        }),
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
        boards: {
          include: {
            columns: true,
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
        _count: {
          select: {
            boards: true,
            members: true,
          },
        },
      },
    });
  }

  async getWorkspaceById(id: string) {
    return prisma.workspace.findUnique({
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
        boards: {
          include: {
            columns: {
              include: {
                items: {
                  include: {
                    assignee: {
                      select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                      },
                    },
                    attachments: true,
                  },
                },
              },
            },
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            boards: true,
            members: true,
          },
        },
      },
    });
  }

  async getTeamWorkspaces(teamId: string) {
    return prisma.workspace.findMany({
      where: { teamId },
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
            boards: true,
            members: true,
          },
        },
      },
    });
  }

  async getUserWorkspaces(userId: string) {
    return prisma.workspace.findMany({
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
        team: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            boards: true,
            members: true,
          },
        },
      },
    });
  }

  async updateWorkspace(id: string, data: Partial<{ name: string; description: string; type: WorkspaceType }>) {
    return prisma.workspace.update({
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

  async deleteWorkspace(id: string) {
    return prisma.workspace.delete({
      where: { id },
    });
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole = 'MEMBER') {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
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

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole) {
    return prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
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

  async removeMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async getMemberRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      select: { role: true },
    });
    return (member?.role as WorkspaceRole) || null;
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
    return !!member;
  }

  async hasPermission(workspaceId: string, userId: string, requiredRole: WorkspaceRole): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      select: { role: true },
    });

    if (!member) return false;

    const roleHierarchy: Record<WorkspaceRole, number> = {
      OWNER: 4,
      ADMIN: 3,
      MEMBER: 2,
      VIEWER: 1,
    };

    return roleHierarchy[member.role as WorkspaceRole] >= roleHierarchy[requiredRole];
  }

  getTemplates(): WorkspaceTemplate[] {
    return Object.values(WORKSPACE_TEMPLATES);
  }

  getTemplate(templateId: string): WorkspaceTemplate | null {
    return WORKSPACE_TEMPLATES[templateId] || null;
  }
}

const workspaceService = new WorkspaceService();
export default workspaceService; 