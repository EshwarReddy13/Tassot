import express from 'express';
import { createUser }  from '../../controllers/users/createUserController.js';
import { getUser }     from '../../controllers/users/getUserController.js';
import { updateUser }  from '../../controllers/users/updateUserController.js';
import { getUsersController } from '../../controllers/users/getUsersController.js';
import { getUserByIdController } from '../../controllers/users/getUserByIdController.js';

const router = express.Router();

// Upsert user (always returns the user record)
router.post('/', createUser);

// Fetch user profile
router.get('/:uid', getUser);

// Partial update
router.patch('/:uid', updateUser);

// Get all users (for admin use)
router.get('/', getUsersController);

// Fetch user profile by Database UUID
router.get('/id/:userId', getUserByIdController);

export default router;
