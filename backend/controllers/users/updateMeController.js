import pool from '../../db.js';

/**
 * PUT /api/users/me
 * Updates the current authenticated user's profile
 * Body may include: { first_name, last_name, photo_url, onboarding }
 */
export async function updateMe(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { first_name, last_name, photo_url, onboarding } = req.body;

  const fields = [];
  const values = [];
  let idx = 1;

  if (first_name !== undefined) {
    fields.push(`first_name = $${idx}`);
    values.push(first_name);
    idx++;
  }
  if (last_name !== undefined) {
    fields.push(`last_name = $${idx}`);
    values.push(last_name);
    idx++;
  }
  if (photo_url !== undefined) {
    fields.push(`photo_url = $${idx}`);
    values.push(photo_url);
    idx++;
  }
  if (onboarding !== undefined) {
    fields.push(`onboarding = $${idx}`);
    values.push(onboarding);
    idx++;
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update.' });
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId); // The userId for the WHERE clause

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING
      id, firebase_uid, email, provider,
      first_name, last_name, photo_url, onboarding,
      settings, created_at, updated_at;
  `;

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    console.log(`User ${userId} profile updated successfully`);
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('updateMe error:', err);
    return res.status(500).json({ error: 'Internal server error while updating user.' });
  }
} 