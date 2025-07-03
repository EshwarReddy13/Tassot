import pool from '../../db.js';

/**
 * GET /api/users/me
 * Returns the current authenticated user's profile
 */
export async function getMe(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        id, firebase_uid, email, provider,
        first_name, last_name, photo_url, onboarding,
        settings, created_at, updated_at
      FROM users
      WHERE id = $1;
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 