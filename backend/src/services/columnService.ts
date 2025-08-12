import prisma from '@/lib/prisma';

export interface CreateColumnInput {
  boardId: string;
  name: string;
  order: number;
}

class ColumnService {
  async createColumn(input: CreateColumnInput) {
    return prisma.column.create({
      data: {
        boardId: input.boardId,
        name: input.name,
        order: input.order,
      },
      include: {
        items: true,
      },
    });
  }

  async updateColumn(id: string, data: Partial<{ name: string; order: number }>) {
    return prisma.column.update({
      where: { id },
      data,
    });
  }

  async deleteColumn(id: string) {
    return prisma.column.delete({ where: { id } });
  }

  async getColumnById(id: string) {
    return prisma.column.findUnique({
      where: { id },
      include: { items: true, board: true },
    });
  }

  async getBoardColumns(boardId: string) {
    return prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: { items: true },
    });
  }
}

const columnService = new ColumnService();
export default columnService;