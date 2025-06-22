import pool from '../../db.js';

export const getUserByEmailController = async (req, res) => {
  const { email } = req.params;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const { rows } = await pool.query(
      `SELECT first_name, last_name, photo_url FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(200).json({ exists: false });
    }

    const { first_name, last_name, photo_url } = rows[0];
    return res.status(200).json({ exists: true, first_name, last_name, photo_url });
  } catch (err) {
    console.error('[getUserByEmailController]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
