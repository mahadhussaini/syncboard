import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { serverConfig } from '@/config';
import logger from '@/utils/logger';
import redisService from '@/lib/redis';
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';
import teamRoutes from '@/routes/teamRoutes';
import workspaceRoutes from '@/routes/workspaceRoutes';
import invitationRoutes from '@/routes/invitationRoutes';
import boardRoutes from '@/routes/boardRoutes';
import aiRoutes from '@/routes/aiRoutes';
import notificationRoutes from '@/routes/notificationRoutes';
import fileRoutes from '@/routes/fileRoutes';
import analyticsRoutes from '@/routes/analyticsRoutes';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { createSocketServer } from '@/realtime/socket';

const app = express();

// Middlewares
app.use(cors({ origin: serverConfig.corsOrigin, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(logger.logRequest);

// Static serving for uploaded files (disk adapter)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const redisStatus = await redisService.ping().catch(() => 'ERR');
    res.status(200).json({ success: true, status: 'OK', redis: redisStatus });
  } catch (error) {
    res.status(200).json({ success: true, status: 'DEGRADED' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Bootstrap server
const server = http.createServer(app);
const io = createSocketServer(server);

async function bootstrap(): Promise<void> {
  try {
    await redisService.connect();

    server.listen(serverConfig.port, () => {
      logger.info(`SyncBoard API listening on http://localhost:${serverConfig.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

export { io };
export default app;