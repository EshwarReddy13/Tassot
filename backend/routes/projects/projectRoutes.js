// src/routes/projectRoutes.js
import express from 'express';
import { createProjectController } from '../../controllers/projects/createProjectController.js';
import { getProjectsController } from '../../controllers/projects/getProjectsController.js';
import { getProjectDetailsController } from '../../controllers/projects/getProjectDetailsController.js';
import { deleteProjectController } from '../../controllers/projects/deleteProjectController.js';
import { editProjectController } from '../../controllers/projects/editProjectController.js';
import { createBoardController } from '../../controllers/projects/boards/createBoardController.js';
import { createTaskController } from '../../controllers/projects/tasks/createTaskController.js';

// Import your authentication middleware
import { requireAuth } from '../../auth/authMiddleware.js'; 

const router = express.Router();
router.use(requireAuth);

// === Routes ===

// Apply authentication middleware to all project routes (or specific ones)
// router.use(requireAuth); // Example: Apply auth to all routes below

// Create Project
// POST /api/projects
// The requireAuth middleware should run before createProjectController
router.post('/', createProjectController);

// Get User's Projects (Example for future use)
// GET /api/projects
router.get('/', getProjectsController);

// Get Specific Project
// GET /api/projects/:projectId
router.get('/:projectUrl', getProjectDetailsController);

// Edit Project
// PUT /api/projects/:projectId 
router.put('/:projectUrl', editProjectController);

// Delete Project
// DELETE /api/projects/:projectId
router.delete('/:projectUrl', deleteProjectController);


// Board-level routes (nested under projects)
router.post('/:projectUrl/boards', createBoardController);

// Create a new task within a board
router.post('/:projectUrl/boards/:boardId/tasks', createTaskController);

export default router;