import prisma from '@/lib/prisma';

type BoardType = 'KANBAN' | 'WHITEBOARD' | 'NOTES' | 'TIMELINE';

export interface CreateBoardInput {
  name: string;
  description?: string;
  type: BoardType;
  workspaceId: string;
  ownerId: string;
}

class BoardService {
  async createBoard(input: CreateBoardInput) {
    return prisma.board.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type as any,
        workspaceId: input.workspaceId,
        ownerId: input.ownerId,
      },
      include: {
        columns: true,
      },
    });
  }

  async getBoardById(id: string) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
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
      },
    });
  }

  async getWorkspaceBoards(workspaceId: string) {
    return prisma.board.findMany({
      where: { workspaceId },
      include: {
        columns: true,
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });
  }

  async updateBoard(id: string, data: Partial<{ name: string; description: string; type: BoardType }>) {
    return prisma.board.update({
      where: { id },
      data: { ...data, ...(data.type ? { type: data.type as any } : {}) },
    });
  }

  async deleteBoard(id: string) {
    return prisma.board.delete({ where: { id } });
  }
}

const boardService = new BoardService();
export default boardService;