import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['KANBAN', 'WHITEBOARD', 'NOTES', 'TIMELINE']).default('KANBAN'),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['KANBAN', 'WHITEBOARD', 'NOTES', 'TIMELINE']).optional(),
});

export const createColumnSchema = z.object({
  name: z.string().min(1).max(100),
  order: z.number().int().min(0),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
});

export const createItemSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['TASK', 'NOTE', 'IDEA', 'BUG', 'FEATURE']).optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  type: z.enum(['TASK', 'NOTE', 'IDEA', 'BUG', 'FEATURE']).optional(),
  assigneeId: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const moveItemSchema = z.object({
  newColumnId: z.string().min(1).optional(),
  newIndex: z.number().int().min(0),
});