import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  uploadItemAttachment,
  listItemAttachments,
  deleteAttachment,
  uploadItemAttachmentMiddleware,
} from '@/controllers/attachmentController';

const router = Router();

router.use(authenticate);

router.post('/items/:itemId/upload', uploadItemAttachmentMiddleware, uploadItemAttachment);
router.get('/items/:itemId', listItemAttachments);
router.delete('/attachments/:id', deleteAttachment);

export default router;