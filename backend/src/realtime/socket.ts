import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@/config';
import logger from '@/utils/logger';
import redis from '@/lib/redis';
import prisma from '@/lib/prisma';
import workspaceService from '@/services/workspaceService';
import { AccessTokenPayload } from '@/services/tokenService';
import { setIO } from '@/realtime/io';

// Define custom types for Socket.IO events
interface ClientToServerEvents {
  join_workspace: (workspaceId: string, callback: (response: { success: boolean; message?: string }) => void) => void;
  leave_workspace: (workspaceId: string) => void;
  join_board: (boardId: string, callback: (response: { success: boolean; message?: string }) => void) => void;
  leave_board: (boardId: string) => void;
  item_update: (payload: { workspaceId: string; boardId: string; itemId: string; data: any }) => void;
  column_update: (payload: { workspaceId: string; boardId: string; columnId: string; data: any }) => void;
  board_update: (payload: { workspaceId: string; boardId: string; data: any }) => void;
}

interface ServerToClientEvents {
  connected: (payload: { userId: string }) => void;
  presence: (payload: { userId: string; online: boolean }) => void;
  item_updated: (payload: { itemId: string; data: any }) => void;
  column_updated: (payload: { columnId: string; data: any }) => void;
  board_updated: (payload: { boardId: string; data: any }) => void;
  notification: (payload: { notification: any }) => void;
}

interface InterServerEvents { ping: () => void; }

interface SocketData { userId: string; workspaceId?: string; boardId?: string; }

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  setIO(io);

  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = (socket.handshake.auth as any)['token'];
    if (!token) return next(new Error('Authentication error: Token not provided'));
    try {
      const payload = jwt.verify(token, jwtConfig.secret) as AccessTokenPayload;
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    if (!userId) { socket.disconnect(true); return; }

    logger.logWebSocket('connected', { userId, socketId: socket.id });
    socket.emit('connected', { userId });

    redis.subscribe(`notifications:${userId}`, (message) => {
      try { const notification = JSON.parse(message); socket.emit('notification', { notification }); } catch (error) { logger.error('Failed to parse notification message:', error); }
    });

    socket.on('join_workspace', async (workspaceId, ack) => {
      const isMember = await workspaceService.isMember(workspaceId, userId);
      if (!isMember) { logger.logWebSocket('join_workspace_denied', { userId, workspaceId }); return ack({ success: false, message: 'Access denied to workspace' }); }
      socket.join(`workspace:${workspaceId}`);
      socket.data.workspaceId = workspaceId;
      logger.logWebSocket('joined_workspace', { userId, workspaceId });
      ack({ success: true });
    });

    socket.on('leave_workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      delete socket.data.workspaceId;
      logger.logWebSocket('left_workspace', { userId, workspaceId });
    });

    socket.on('join_board', async (boardId, ack) => {
      const board = await prisma.board.findUnique({ where: { id: boardId }, select: { workspaceId: true } });
      if (!board || !(await workspaceService.isMember(board.workspaceId, userId))) {
        logger.logWebSocket('join_board_denied', { userId, boardId });
        return ack({ success: false, message: 'Access denied to board' });
      }
      socket.join(`board:${boardId}`);
      socket.data.boardId = boardId;
      logger.logWebSocket('joined_board', { userId, boardId });
      ack({ success: true });
    });

    socket.on('leave_board', (boardId) => {
      socket.leave(`board:${boardId}`);
      delete socket.data.boardId;
      logger.logWebSocket('left_board', { userId, boardId });
    });

    socket.on('item_update', (payload) => {
      logger.logWebSocket('item_update', { userId, ...payload });
      io.to(`board:${payload.boardId}`).emit('item_updated', { itemId: payload.itemId, data: payload.data });
    });

    socket.on('column_update', (payload) => {
      logger.logWebSocket('column_update', { userId, ...payload });
      io.to(`board:${payload.boardId}`).emit('column_updated', { columnId: payload.columnId, data: payload.data });
    });

    socket.on('board_update', (payload) => {
      logger.logWebSocket('board_update', { userId, ...payload });
      io.to(`workspace:${payload.workspaceId}`).emit('board_updated', { boardId: payload.boardId, data: payload.data });
    });

    socket.on('disconnect', () => {
      logger.logWebSocket('disconnected', { userId, socketId: socket.id });
      redis.unsubscribe(`notifications:${userId}`);
    });
  });

  return io;
}