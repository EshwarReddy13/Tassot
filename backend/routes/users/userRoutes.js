import express from 'express';
import { createUser } from '../../controllers/users/createUserController.js';
import { getUser } from '../../controllers/users/getUserController.js';
import { updateUser } from '../../controllers/users/updateUserController.js';
import { getUsersController } from '../../controllers/users/getUsersController.js';
import { getUserByIdController } from '../../controllers/users/getUserByIdController.js';
import { getUserByEmailController } from '../../controllers/users/getUserByEmailController.js';
import { updateOnboardingController } from '../../controllers/users/updateOnboardingController.js';
import { getMe } from '../../controllers/users/getMeController.js';
import { updateMe } from '../../controllers/users/updateMeController.js';

// ADDED: Import the authentication middleware
import { requireAuth } from '../../auth/authMiddleware.js';

const router = express.Router();

// PUBLIC: To create/sync a user on login. NO middleware.
router.post('/', createUser);

// PROTECTED: All routes below require authentication
router.put('/onboarding', requireAuth, updateOnboardingController);
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.get('/', requireAuth, getUsersController);
router.get('/id/:userId', requireAuth, getUserByIdController);
router.get('/email/:email', requireAuth, getUserByEmailController);
router.get('/:uid', requireAuth, getUser);
router.patch('/:uid', requireAuth, updateUser);

export default router;