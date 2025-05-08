// src/routes/userRoutes.js
import express from 'express';
import { createUser } from '../../controllers/users/createUserController.js'; // Ensure this path is correct
import { getUser } from '../../controllers/users/getUserController.js';       // Ensure this path is correct
import { updateUser } from '../../controllers/users/updateUserController.js'; // Ensure this path is correct

const router = express.Router();

/**
 * @route   POST /api/users/createUser
 * @desc    Creates a new user.
 * @access  Public (or protected, depending on your setup)
 */
router.post('/createUser', createUser);

/**
 * @route   GET /api/users/:uid
 * @desc    Fetches the user with firebase_uid = :uid
 * @access  Public (or protected)
 */
router.get('/:uid', getUser);

/**
 * @route   POST /api/users/updateUser/:uid
 * @desc    Partially updates fields on the user with firebase_uid = :uid using POST
 * @access  Protected (user should only be able to update their own profile typically)
 */
router.post('/updateUser/:uid', updateUser);

export default router;