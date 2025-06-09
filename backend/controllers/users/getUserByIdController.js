import pool from '../../db.js';

/**
 * GET /api/users/id/:userId
 * Returns the user row matching the database UUID = :userId
 */
export const getUserByIdController = async (req, res) => {
  const { userId } = req.params;
  console.log(`[getUserByIdController] Received request for user ID: ${userId}`);

  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, photo_url 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    console.log(`[getUserByIdController] Database query returned ${rows.length} row(s).`);

    if (rows.length === 0) {
      console.warn(`[getUserByIdController] User not found for ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[getUserByIdController] Successfully found user:`, rows[0]);
    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('[getUserByIdController] CRITICAL ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};