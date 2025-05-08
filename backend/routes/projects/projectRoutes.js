// src/routes/projectRoutes.js
import express from 'express';
import { createProjectController } from '../../controllers/projects/createProjectController.js';
import { getProjectsController } from '../../controllers/projects/getProjectsController.js';

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

// Get Specific Project (Example for future use)
// GET /api/projects/:projectKeyOrId
// router.get('/:projectKeyOrId', /* requireAuth, */ getProjectDetailsController);

export default router;