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

import { removeUserFromProjectController } from '../../controllers/users/removeUserFromProjectController.js';
import { updateMemberRoleController } from '../../controllers/users/updateMemberRoleController.js';

import { getSettingsController } from '../../controllers/projects/settings/getSettingsController.js';
import { updateSettingsController } from '../../controllers/projects/settings/updateSettingsController.js';

import { requireAuth } from '../../auth/authMiddleware.js'; 
import { requireProjectRole } from '../../auth/requireProjectRole.js';

const router = express.Router();
router.use(requireAuth);

// === Project Routes ===
router.post('/', createProjectController);
router.get('/', getProjectsController);
router.get('/:projectUrl', getProjectDetailsController);
router.put('/:projectUrl', requireProjectRole(['owner']), editProjectController);
router.delete('/:projectUrl', requireProjectRole(['owner']), deleteProjectController);


// === Board Routes ===
router.post('/:projectUrl/boards', requireProjectRole(['owner', 'editor', 'user']), createBoardController);
router.put('/:projectUrl/boards/:boardId', requireProjectRole(['owner', 'editor']), updateBoardController);
router.delete('/:projectUrl/boards/:boardId', requireProjectRole(['owner', 'editor']), deleteBoardController);


// === Task Routes ===
router.post('/:projectUrl/boards/:boardId/tasks', requireProjectRole(['owner', 'editor', 'user']), createTaskController);
router.put('/:projectUrl/tasks/:taskId', requireProjectRole(['owner', 'editor', 'user']), updateTaskController); 
router.delete('/:projectUrl/tasks/:taskId', requireProjectRole(['owner', 'editor', 'user']), deleteTaskController);


// === Invitation Routes ===
router.post('/:projectUrl/invitations', requireProjectRole(['owner', 'editor']), createInvitationController);

// === User Management Routes ===
router.put('/:projectUrl/members/:memberId', updateMemberRoleController); // Authorization logic is inside this controller
router.delete('/:projectUrl/members/:memberId', requireProjectRole(['owner', 'editor']), removeUserFromProjectController);

// === Settings Routes ===
router.get('/:projectUrl/settings', getSettingsController);
router.put('/:projectUrl/settings', requireProjectRole(['owner', 'editor']), updateSettingsController);

export default router;