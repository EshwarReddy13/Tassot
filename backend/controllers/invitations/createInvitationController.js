import pool from '../../db.js';
import crypto from 'crypto';

export const createInvitationController = async (req, res) => {
  const { projectUrl } = req.params;
  const { invitee_email } = req.body;
  const { id: inviter_id } = req.user;

  if (!invitee_email) {
    return res.status(400).json({ error: 'Invitee email is required.' });
  }

  try {
    // 1. Get project details, including the owner_id
    const projectQuery = await pool.query(
      `SELECT id, project_name, owner_id FROM projects WHERE project_url = $1`,
      [projectUrl]
    );

    if (projectQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const { id: project_id, project_name, owner_id } = projectQuery.rows[0];

    // --- SECURITY CHECK: Ensure the inviter is the project owner ---
    if (owner_id !== inviter_id) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can send invitations.' });
    }

    // 2. Check if the user is already a member of the project
    const existingMemberQuery = await pool.query(
      `SELECT u.id FROM users u
       JOIN project_users pu ON u.id = pu.user_id
       WHERE u.email = $1 AND pu.project_id = $2`,
      [invitee_email, project_id]
    );

    if (existingMemberQuery.rows.length > 0) {
      return res.status(409).json({ error: 'This user is already a member of the project.' });
    }
    
    // 3. Check for an existing pending invitation
    const existingInviteQuery = await pool.query(
        `SELECT id FROM invitations WHERE project_id = $1 AND invitee_email = $2 AND status = 'pending' AND expires_at > now()`,
        [project_id, invitee_email]
    );

    if (existingInviteQuery.rows.length > 0) {
        return res.status(409).json({ error: 'An invitation is already pending for this email address.' });
    }

    // 4. Generate a secure token and create the invitation
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO invitations (token, project_id, invitee_email, inviter_id) VALUES ($1, $2, $3, $4)`,
      [token, project_id, invitee_email, inviter_id]
    );

    // 5. Simulate sending an email
    const inviteLink = `${process.env.FRONTEND_ORIGIN}/accept-invite?token=${token}`;
    
    console.log('--- SIMULATED EMAIL ---');
    console.log(`To: ${invitee_email}`);
    console.log(`Subject: You're invited to the '${project_name}' project!`);
    console.log(`Click this link to accept: ${inviteLink}`);
    console.log('-----------------------');

    res.status(201).json({ message: 'Invitation sent successfully.' });

  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};