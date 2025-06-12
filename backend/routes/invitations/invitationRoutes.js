import express from 'express';
import { verifyInvitationController } from '../../controllers/invitations/verifyInvitationController.js';
import { acceptInvitationController } from '../../controllers/invitations/acceptInvitationController.js';
import { requireAuth } from '../../auth/authMiddleware.js';

const router = express.Router();

// This route is public, anyone with a token can try to verify it.
router.get('/:token', verifyInvitationController);

// This route requires the user to be logged in to accept an invitation.
router.post('/accept', requireAuth, acceptInvitationController);

export default router;