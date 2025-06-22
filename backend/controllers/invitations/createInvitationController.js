import pool from '../../db.js';
import { createAndSendInvitation } from '../../services/invitationService.js';

export const createInvitationController = async (req, res) => {
  const { projectUrl } = req.params;
  const { invitee_email } = req.body;
  const { id: inviter_id } = req.user;

  if (!invitee_email) {
    return res.status(400).json({ error: 'Invitee email is required.' });
  }

  try {
    const projectQuery = await pool.query(
      `SELECT id, project_name, owner_id FROM projects WHERE project_url = $1`,
      [projectUrl]
    );

    if (projectQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const { id: project_id, project_name, owner_id } = projectQuery.rows[0];

    if (owner_id !== inviter_id) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can send invitations.' });
    }
    
    await createAndSendInvitation({
        projectId: project_id,
        projectName: project_name,
        inviterId: inviter_id,
        inviteeEmail: invitee_email
    });

    res.status(200).json({ message: 'Invitation sent successfully.' });

  } catch (error) {
    console.error(`Error in createInvitationController for ${invitee_email}:`, error.message);
    if (error.message.includes('already a member') || error.message.includes('already pending')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error while creating invitation.' });
  }
};