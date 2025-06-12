import pool from '../../db.js';

export const verifyInvitationController = async (req, res) => {
  const { token } = req.params;

  try {
    const query = `
      SELECT 
        i.invitee_email, 
        p.project_name, 
        u.first_name as inviter_first_name, 
        u.last_name as inviter_last_name
      FROM invitations i
      JOIN projects p ON i.project_id = p.id
      JOIN users u ON i.inviter_id = u.id
      WHERE i.token = $1 AND i.status = 'pending' AND i.expires_at > now()
    `;
    const { rows } = await pool.query(query, [token]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found, is expired, or has already been accepted.' });
    }

    const inviter_name = `${rows[0].inviter_first_name} ${rows[0].inviter_last_name}`;
    
    res.status(200).json({
      invitee_email: rows[0].invitee_email,
      project_name: rows[0].project_name,
      inviter_name: inviter_name,
    });

  } catch (error) {
    console.error('Error verifying invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};