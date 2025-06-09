// src/controllers/users/getUsersController.js
import pool from '../../db.js';

export const getUsersController = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email FROM users ORDER BY first_name`
    );
    res.json(rows);
  } catch (err) {
    console.error('getUsersController error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
