import prisma from '@/lib/prisma';

type ItemType = 'TASK' | 'NOTE' | 'IDEA' | 'BUG' | 'FEATURE';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CreateItemInput {
  columnId: string;
  title: string;
  description?: string;
  type?: ItemType;
  assigneeId?: string;
  priority?: Priority;
  dueDate?: Date | null;
  tags?: string[];
}

class ItemService {
  async createItem(input: CreateItemInput) {
    // Determine next order at end of column
    const count = await prisma.boardItem.count({ where: { columnId: input.columnId } });
    return prisma.boardItem.create({
      data: {
        columnId: input.columnId,
        title: input.title,
        description: input.description,
        type: (input.type ?? 'TASK') as any,
        assigneeId: input.assigneeId ?? null,
        priority: (input.priority ?? 'MEDIUM') as any,
        dueDate: input.dueDate ?? null,
        tags: input.tags ?? [],
        order: count,
      },
      include: {
        assignee: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
        attachments: true,
      },
    });
  }

  async updateItem(id: string, data: Partial<{
    title: string;
    description: string | null;
    type: ItemType;
    assigneeId: string | null;
    priority: Priority;
    dueDate: Date | null;
    tags: string[];
    order: number;
  }>) {
    return prisma.boardItem.update({
      where: { id },
      data: {
        ...data,
        ...(data.type ? { type: data.type as any } : {}),
        ...(data.priority ? { priority: data.priority as any } : {}),
      },
      include: {
        assignee: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
        attachments: true,
      },
    });
  }

  async deleteItem(id: string) {
    return prisma.boardItem.delete({ where: { id } });
  }

  async moveItem(id: string, newColumnId: string) {
    // Move to end of target column
    const count = await prisma.boardItem.count({ where: { columnId: newColumnId } });
    return prisma.boardItem.update({
      where: { id },
      data: { columnId: newColumnId, order: count },
    });
  }

  async getItemById(id: string) {
    return prisma.boardItem.findUnique({
      where: { id },
      include: {
        column: { include: { board: { include: { workspace: true } } } },
        assignee: true,
      },
    });
  }
}

const itemService = new ItemService();
export default itemService;