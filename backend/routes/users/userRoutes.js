// src/routes/userRoutes.js
import express from 'express';
import { createUser } from '../../controllers/users/createUserController.js';
import { getUser } from '../../controllers/users/getUserController.js';
import { updateUser } from '../../controllers/users/updateUserController.js';

const router = express.Router();

/**
 * POST /api/users
 * Creates a new user. Fails if firebase_uid already exists.
 */
router.post('/', createUser);

/**
 * GET /api/users/:uid
 * Fetches the user with firebase_uid = :uid
 */
router.get('/:uid', getUser);

/**
 * PATCH /api/users/:uid
 * Partially updates fields on the user with firebase_uid = :uid
 */
router.patch('/:uid', updateUser);

export default router;
