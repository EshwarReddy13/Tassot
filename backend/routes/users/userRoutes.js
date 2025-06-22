import express from 'express';
import { createUser } from '../../controllers/users/createUserController.js';
import { getUser } from '../../controllers/users/getUserController.js';
import { updateUser } from '../../controllers/users/updateUserController.js';
import { getUsersController } from '../../controllers/users/getUsersController.js';
import { getUserByIdController } from '../../controllers/users/getUserByIdController.js';
import { getUserByEmailController } from '../../controllers/users/getUserByEmailController.js';

// ADDED: Import the authentication middleware
import { requireAuth } from '../../auth/authMiddleware.js';

const router = express.Router();

// PUBLIC: To create/sync a user on login. NO middleware.
router.post('/', createUser);

// The following routes are PROTECTED and require a valid user.
// ADDED: Apply the 'requireAuth' middleware to all protected routes.
// Any request to these endpoints will now first be validated by the middleware.
router.get('/', requireAuth, getUsersController);
router.get('/id/:userId', requireAuth, getUserByIdController);
router.get('/:uid', requireAuth, getUser);
router.patch('/:uid', requireAuth, updateUser);
router.get('/email/:email', requireAuth, getUserByEmailController);

export default router;