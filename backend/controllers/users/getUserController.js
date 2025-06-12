import pool from '../../db.js';

/**
 * GET /api/users/:uid
 * Returns the user row matching firebase_uid = :uid
 */
export async function getUser(req, res) {
  const { uid } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        id, firebase_uid AS "uid", email, provider,
        first_name AS "firstName", last_name AS "lastName",
        created_at AS "createdAt", updated_at AS "updatedAt"
      FROM users
      WHERE firebase_uid = $1;
      `,
      [uid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('getUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
