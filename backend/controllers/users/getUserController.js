import pool from '../../db.js';

/**
 * GET /api/users/:uid
 * Returns the user row matching firebase_uid = :uid
 */
export async function getUser(req, res) {
  const { uid } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT
         id, firebase_uid, email, provider,
         first_name, last_name, created_at, updated_at
       FROM users
       WHERE firebase_uid = $1;`,
      [uid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
