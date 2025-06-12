import express from 'express';
import { getCommentsController } from '../../controllers/comments/getCommentsController.js';
import { createCommentController } from '../../controllers/comments/createCommentController.js';
import { requireAuth } from '../../auth/authMiddleware.js';

const router = express.Router();

// All comment routes require authentication
router.use(requireAuth);

// Get all comments for a task
router.get('/tasks/:taskId/comments', getCommentsController);

// Create a new comment on a task
router.post('/tasks/:taskId/comments', createCommentController);

export default router;