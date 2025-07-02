import pool from '../../db.js';

/**
 * POST /api/users
 * Creates a new user or updates an existing one based on their Firebase UID.
 * This is designed to be called after a user signs in to sync their profile.
 * Body: {
 *   id: string,          // Firebase UID
 *   email: string,
 *   provider: string,
 *   firstName: string,
 *   lastName: string,
 *   photoURL: string | null
 * }
 */
export async function createUser(req, res) {
  console.log('createUser called with body:', req.body);
  
  const {
    id: firebaseUid,
    email,
    provider,
    firstName,
    lastName,
    photoURL, // Get the photoURL from the request
  } = req.body;

  console.log('Extracted values:', { firebaseUid, email, provider, firstName, lastName, photoURL });

  if (!firebaseUid || !email || !provider || !firstName || !lastName) {
    console.log('Missing required fields:', { firebaseUid, email, provider, firstName, lastName });
    return res.status(400).json({ error: 'Missing required user profile fields' });
  }

  try {
    console.log('Executing database query with params:', [firebaseUid, email, provider, firstName, lastName, photoURL]);
    const { rows } = await pool.query(
      `
      INSERT INTO users (
        firebase_uid, email, provider, first_name, last_name, photo_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
      ON CONFLICT (firebase_uid) DO UPDATE
      SET
        email       = EXCLUDED.email,
        provider    = EXCLUDED.provider,
        first_name  = EXCLUDED.first_name,
        last_name   = EXCLUDED.last_name,
        photo_url   = EXCLUDED.photo_url, -- Update the photoURL if it changes
        updated_at  = NOW()
      RETURNING
        id,
        firebase_uid,
        email,
        provider,
        first_name,
        last_name,
        photo_url, -- Return the saved photo_url
        settings,
        created_at,
        updated_at;
      `,
      [
        firebaseUid,
        email,
        provider,
        firstName,
        lastName,
        photoURL, // Pass it as the 6th parameter
      ]
    );

    if (rows.length === 0) {
      return res.status(500).json({ error: 'Database operation failed to return user.' });
    }
    
    // Send the complete user profile back to the client
    return res.status(200).json(rows[0]);

  } catch (err) {
    console.error('Error in createUser controller:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      where: err.where
    });
    return res.status(500).json({ error: 'Internal server error while syncing user.' });
  }
}