// src/routes/projectRoutes.js
import express from 'express';
import { createProjectController } from '../../controllers/projects/createProjectController.js';
import { getProjectsController } from '../../controllers/projects/getProjectsController.js';
import { getProjectDetailsController } from '../../controllers/projects/getProjectDetailsController.js';
import { deleteProjectController } from '../../controllers/projects/deleteProjectController.js';
import { editProjectController } from '../../controllers/projects/editProjectController.js';

import { createBoardController } from '../../controllers/projects/boards/createBoardController.js';
import { deleteBoardController } from '../../controllers/projects/boards/deleteBoardController.js';
import { updateBoardController } from '../../controllers/projects/boards/updateBoardController.js';

import { createTaskController } from '../../controllers/projects/tasks/createTaskController.js';
import { updateTaskController } from '../../controllers/projects/tasks/updateTaskController.js'; 
import { deleteTaskController } from '../../controllers/projects/tasks/deleteTaskController.js';

import { createInvitationController } from '../../controllers/invitations/createInvitationController.js';

// Import your authentication middleware
import { requireAuth } from '../../auth/authMiddleware.js'; 

const router = express.Router();
router.use(requireAuth);

// === Project Routes ===

// Create Project
router.post('/', createProjectController);

// Get User's Projects
router.get('/', getProjectsController);

// Get Specific Project
router.get('/:projectUrl', getProjectDetailsController);

// Edit Project
router.put('/:projectUrl', editProjectController);

// Delete Project
router.delete('/:projectUrl', deleteProjectController);


// === Board Routes ===
router.post('/:projectUrl/boards', createBoardController);

// Update a specific board
router.put('/:projectUrl/boards/:boardId', updateBoardController);

// Delete a specific board
router.delete('/:projectUrl/boards/:boardId', deleteBoardController);


// === Task Routes ===
// Create a new task within a board
router.post('/:projectUrl/boards/:boardId/tasks', createTaskController);

// Update a specific task
router.put('/:projectUrl/tasks/:taskId', updateTaskController); 

// Delete a specific task
router.delete('/:projectUrl/tasks/:taskId', deleteTaskController);


// === Invitation Routes ===
router.post('/:projectUrl/invitations', createInvitationController);


export default router;