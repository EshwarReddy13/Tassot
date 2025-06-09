import pool from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/users
 * Inserts or updates a user by firebase_uid and returns the row.
 * Body: { id: firebaseUid, email, provider, firstName, lastName }
 */
export async function createUser(req, res) {
  const {
    id: firebaseUid,
    email,
    provider,
    firstName,
    lastName
  } = req.body;

  if (!firebaseUid || !email || !provider || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO users (
        id, firebase_uid, email, provider,
        first_name, last_name, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
      ON CONFLICT (firebase_uid) DO UPDATE
      SET
        email       = EXCLUDED.email,
        provider    = EXCLUDED.provider,
        first_name  = EXCLUDED.first_name,
        last_name   = EXCLUDED.last_name,
        updated_at  = NOW()
      RETURNING
        id, firebase_uid AS "uid", email, provider,
        first_name AS "firstName", last_name AS "lastName",
        created_at AS "createdAt", updated_at AS "updatedAt";
      `,
      [
        uuidv4(),
        firebaseUid,
        email,
        provider,
        firstName,
        lastName
      ]
    );

    return res.json(rows[0]);
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
