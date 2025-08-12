import { Request, Response } from 'express';
import { z } from 'zod';
import boardService from '@/services/boardService';
import columnService from '@/services/columnService';
import itemService from '@/services/itemService';
import workspaceService from '@/services/workspaceService';
import logger from '@/utils/logger';
import { emitItemUpdated, emitColumnUpdated, emitBoardUpdated } from '@/realtime/events';
import {
  createBoardSchema,
  updateBoardSchema,
  createColumnSchema,
  updateColumnSchema,
  createItemSchema,
  updateItemSchema,
  moveItemSchema,
} from '@/validation/boardSchemas';

export async function createBoard(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;
    const parsed = createBoardSchema.parse(req.body);

    const hasPermission = await workspaceService.hasPermission(workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const board = await boardService.createBoard({
      ...parsed,
      workspaceId,
      ownerId: userId,
    });

    // Broadcast board update to workspace
    emitBoardUpdated(workspaceId, { boardId: board.id, action: 'created', board });
    res.status(201).json({ success: true, data: board });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Failed to create board:', error);
    res.status(500).json({ success: false, error: 'Failed to create board' });
  }
}

export async function getWorkspaceBoards(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.id as string;

    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const boards = await boardService.getWorkspaceBoards(workspaceId);
    res.status(200).json({ success: true, data: boards });
  } catch (error) {
    logger.error('Failed to get workspace boards:', error);
    res.status(500).json({ success: false, error: 'Failed to get workspace boards' });
  }
}

export async function getBoard(req: Request, res: Response): Promise<void> {
  try {
    const boardId = req.params.id;
    const userId = req.user?.id as string;

    const board = await boardService.getBoardById(boardId);
    if (!board) {
      res.status(404).json({ success: false, error: 'Board not found' });
      return;
    }

    const isMember = await workspaceService.isMember(board.workspaceId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.status(200).json({ success: true, data: board });
  } catch (error) {
    logger.error('Failed to get board:', error);
    res.status(500).json({ success: false, error: 'Failed to get board' });
  }
}

export async function updateBoard(req: Request, res: Response): Promise<void> {
  try {
    const boardId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = updateBoardSchema.parse(req.body);

    const board = await boardService.getBoardById(boardId);
    if (!board) {
      res.status(404).json({ success: false, error: 'Board not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const updated = await boardService.updateBoard(boardId, parsed);
    emitBoardUpdated(board.workspaceId, { boardId: boardId, action: 'updated' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Failed to update board:', error);
    res.status(500).json({ success: false, error: 'Failed to update board' });
  }
}

export async function deleteBoard(req: Request, res: Response): Promise<void> {
  try {
    const boardId = req.params.id;
    const userId = req.user?.id as string;

    const board = await boardService.getBoardById(boardId);
    if (!board) {
      res.status(404).json({ success: false, error: 'Board not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(board.workspaceId, userId, 'OWNER');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Only owners can delete boards' });
      return;
    }

    await boardService.deleteBoard(boardId);
    emitBoardUpdated(board.workspaceId, { boardId: boardId, action: 'deleted' });
    res.status(200).json({ success: true, message: 'Board deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete board:', error);
    res.status(500).json({ success: false, error: 'Failed to delete board' });
  }
}

export async function createColumn(req: Request, res: Response): Promise<void> {
  try {
    const boardId = req.params.boardId;
    const userId = req.user?.id as string;
    const parsed = createColumnSchema.parse(req.body);

    const board = await boardService.getBoardById(boardId);
    if (!board) {
      res.status(404).json({ success: false, error: 'Board not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const column = await columnService.createColumn({ ...parsed, boardId });
    emitColumnUpdated(boardId, { columnId: column.id, action: 'created' });
    res.status(201).json({ success: true, data: column });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Failed to create column:', error);
    res.status(500).json({ success: false, error: 'Failed to create column' });
  }
}

export async function updateColumn(req: Request, res: Response): Promise<void> {
  try {
    const columnId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = updateColumnSchema.parse(req.body);

    const column = await columnService.getColumnById(columnId);
    if (!column) {
      res.status(404).json({ success: false, error: 'Column not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(column.board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const updated = await columnService.updateColumn(columnId, parsed);
    emitColumnUpdated(column.boardId, { columnId, action: 'updated' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Failed to update column:', error);
    res.status(500).json({ success: false, error: 'Failed to update column' });
  }
}

export async function deleteColumn(req: Request, res: Response): Promise<void> {
  try {
    const columnId = req.params.id;
    const userId = req.user?.id as string;

    const column = await columnService.getColumnById(columnId);
    if (!column) {
      res.status(404).json({ success: false, error: 'Column not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(column.board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    await columnService.deleteColumn(columnId);
    emitColumnUpdated(column.boardId, { columnId, action: 'deleted' });
    res.status(200).json({ success: true, message: 'Column deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete column:', error);
    res.status(500).json({ success: false, error: 'Failed to delete column' });
  }
}

export async function createItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const parsed = createItemSchema.parse(req.body);

    const column = await columnService.getColumnById(parsed.columnId);
    if (!column) {
      res.status(404).json({ success: false, error: 'Column not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(column.board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const item = await itemService.createItem(parsed);
    emitItemUpdated(column.boardId, { itemId: item.id, action: 'created' });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Failed to create item:', error);
    res.status(500).json({ success: false, error: 'Failed to create item' });
  }
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  try {
    const itemId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = updateItemSchema.parse(req.body);

    const item = await itemService.getItemById(itemId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Item not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(item.column.board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const updated = await itemService.updateItem(itemId, parsed);
    emitItemUpdated(item.column.boardId, { itemId, action: 'updated' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Failed to update item:', error);
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
}

export async function deleteItem(req: Request, res: Response): Promise<void> {
  try {
    const itemId = req.params.id;
    const userId = req.user?.id as string;

    const item = await itemService.getItemById(itemId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Item not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(item.column.board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    await itemService.deleteItem(itemId);
    emitItemUpdated(item.column.boardId, { itemId, action: 'deleted' });
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
}

export async function moveItem(req: Request, res: Response): Promise<void> {
  try {
    const itemId = req.params.id;
    const userId = req.user?.id as string;
    const parsed = moveItemSchema.parse(req.body);

    const item = await itemService.getItemById(itemId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Item not found' });
      return;
    }

    const hasPermission = await workspaceService.hasPermission(item.column.board.workspaceId, userId, 'ADMIN');
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    const moved = await itemService.moveItem(itemId, parsed.newColumnId!);
    emitItemUpdated(item.column.boardId, { itemId, action: 'moved', toColumnId: parsed.newColumnId });
    res.status(200).json({ success: true, data: moved });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map((e) => e.message).join(', ') });
      return;
    }
    logger.error('Failed to move item:', error);
    res.status(500).json({ success: false, error: 'Failed to move item' });
  }
}