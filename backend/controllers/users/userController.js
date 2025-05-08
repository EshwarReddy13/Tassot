import pool from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

export async function upsertUser(req, res) {
  const { id: firebaseUid, email, provider, firstName, lastName } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (
         id, firebase_uid, email, provider, first_name, last_name,
         created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6, now(), now())
       ON CONFLICT (firebase_uid) DO UPDATE
         SET email = EXCLUDED.email,
             provider = EXCLUDED.provider,
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             updated_at = now()
       RETURNING *;`,
      [uuidv4(), firebaseUid, email, provider, firstName, lastName]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('User upsert error', err);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
}