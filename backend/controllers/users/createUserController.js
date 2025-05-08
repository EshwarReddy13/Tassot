import pool from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/createUser
 * Creates a new user. Fails if a user with the same firebase_uid already exists.
 * Body: { id: firebaseUid, email, provider, firstName, lastName }
 */
export async function createUser(req, res) {
  const { id: firebaseUid, email, provider, firstName, lastName } = req.body;
  if (!firebaseUid || !email || !provider || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userId = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO users (
         id, firebase_uid, email, provider,
         first_name, last_name, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6, NOW(), NOW())
       ON CONFLICT (firebase_uid) DO NOTHING
       RETURNING *;`,
      [userId, firebaseUid, email, provider, firstName, lastName]
    );

    if (rows.length === 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
