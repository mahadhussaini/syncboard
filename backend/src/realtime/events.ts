import { getIO } from '@/realtime/io';

export function emitItemUpdated(boardId: string, payload: any) {
  const io = getIO();
  if (!io) return;
  io.to(`board:${boardId}`).emit('item_updated', payload);
}

export function emitColumnUpdated(boardId: string, payload: any) {
  const io = getIO();
  if (!io) return;
  io.to(`board:${boardId}`).emit('column_updated', payload);
}

export function emitBoardUpdated(workspaceId: string, payload: any) {
  const io = getIO();
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit('board_updated', payload);
}