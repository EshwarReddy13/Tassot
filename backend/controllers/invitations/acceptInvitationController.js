import pool from '../../db.js';

export const acceptInvitationController = async (req, res) => {
  const { token } = req.body;
  const { id: user_id, email: user_email } = req.user;

  if (!token) {
    return res.status(400).json({ error: 'Invitation token is required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get the invitation and lock the row for the transaction
    const inviteQuery = `
      SELECT i.id, i.project_id, i.invitee_email, p.project_url 
      FROM invitations i
      JOIN projects p ON i.project_id = p.id
      WHERE i.token = $1 AND i.status = 'pending' AND i.expires_at > now()
      FOR UPDATE
    `;
    const { rows } = await client.query(inviteQuery, [token]);

    if (rows.length === 0) {
      throw new Error('Invitation is invalid or has expired.');
    }
    const invitation = rows[0];

    // 2. Security Check: Ensure the logged-in user's email matches the invite
    if (invitation.invitee_email.toLowerCase() !== user_email.toLowerCase()) {
      throw new Error('This invitation is for a different email address.');
    }

    // 3. Add the user to the project
    await client.query(
      `INSERT INTO project_users (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [invitation.project_id, user_id]
    );

    // 4. Update the invitation status to 'accepted'
    await client.query(
      `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
      [invitation.id]
    );

    await client.query('COMMIT');
    
    res.status(200).json({ 
        message: 'Invitation accepted successfully.',
        project_url: invitation.project_url // Send this for redirection
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error accepting invitation:', error);
    // Send a more generic error message to the client for security
    res.status(400).json({ error: error.message || 'Could not accept invitation.' });
  } finally {
    client.release();
  }
};