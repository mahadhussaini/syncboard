import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  processAIRequest,
  suggestTasks,
  summarizeMeeting,
  generateTimeline,
  reviewCode,
  getAIHistory,
} from '@/controllers/aiController';

const router = Router();

router.use(authenticate);

// General AI request processing
router.post('/workspace/:workspaceId/request', processAIRequest);

// Specific AI assistant endpoints
router.post('/workspace/:workspaceId/suggest-tasks', suggestTasks);
router.post('/workspace/:workspaceId/summarize-meeting', summarizeMeeting);
router.post('/workspace/:workspaceId/generate-timeline', generateTimeline);
router.post('/workspace/:workspaceId/review-code', reviewCode);

// AI history
router.get('/workspace/:workspaceId/history', getAIHistory);

export default router; 