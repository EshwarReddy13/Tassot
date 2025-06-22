import express from 'express';

import { enhanceTaskNameController } from '../../controllers/ai/enhanceTaskNameController.js';
import { enhanceTaskDescriptionController } from '../../controllers/ai/enhanceTaskDescriptionController.js';

import { requireAuth } from '../../auth/authMiddleware.js';

const router = express.Router();

// All AI routes should require authentication
router.use(requireAuth);

// Route to handle text enhancement
router.post('/tasks/task-name', enhanceTaskNameController);

// Route to handle task description enhancement
router.post('/tasks/task-description', enhanceTaskDescriptionController);

export default router;