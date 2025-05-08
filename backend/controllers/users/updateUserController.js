import pool from '../../db.js';

/**
 * PATCH /api/users/:uid
 * Updates one or more of: email, provider, first_name, last_name
 * Body may include any subset of { email, provider, firstName, lastName }
 */
export async function updateUser(req, res) {
  const { uid } = req.params;
  const { email, provider, firstName, lastName } = req.body;

  // Build dynamic SET clause
  const fields = [];
  const values = [];
  let idx = 1;

  if (email)      { fields.push(`email = $${idx}`);        values.push(email);      idx++; }
  if (provider)   { fields.push(`provider = $${idx}`);     values.push(provider);   idx++; }
  if (firstName)  { fields.push(`first_name = $${idx}`);   values.push(firstName);  idx++; }
  if (lastName)   { fields.push(`last_name = $${idx}`);    values.push(lastName);   idx++; }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  // always update timestamp
  fields.push(`updated_at = NOW()`);

  // add uid for WHERE clause
  values.push(uid);
  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE firebase_uid = $${idx}
    RETURNING *;`;

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
