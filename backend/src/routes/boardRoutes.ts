import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  createBoard,
  getWorkspaceBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  createColumn,
  updateColumn,
  deleteColumn,
  createItem,
  updateItem,
  deleteItem,
  moveItem,
} from '@/controllers/boardController';
import { trackBoardCreated, trackBoardUpdated, trackBoardDeleted, trackColumnCreated, trackColumnUpdated, trackColumnDeleted, trackItemCreated, trackItemUpdated, trackItemDeleted, trackItemMoved } from '@/middleware/analytics';

const router = Router();

router.use(authenticate);

// Boards in workspace
router.get('/workspace/:workspaceId', getWorkspaceBoards);
router.post('/workspace/:workspaceId', trackBoardCreated, createBoard);

// Board CRUD
router.get('/:id', getBoard);
router.put('/:id', trackBoardUpdated, updateBoard);
router.delete('/:id', trackBoardDeleted, deleteBoard);

// Columns
router.post('/:boardId/columns', trackColumnCreated, createColumn);
router.put('/columns/:id', trackColumnUpdated, updateColumn);
router.delete('/columns/:id', trackColumnDeleted, deleteColumn);

// Items
router.post('/items', trackItemCreated, createItem);
router.put('/items/:id', trackItemUpdated, updateItem);
router.delete('/items/:id', trackItemDeleted, deleteItem);
router.post('/items/:id/move', trackItemMoved, moveItem);

export default router;