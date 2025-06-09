// src/controllers/projects/editProjectController.js
import pool from '../../db.js';

export const editProjectController = async (req, res) => {
  const { projectUrl } = req.params;
  const { project_name, project_key, owner_id } = req.body;
  const firebaseUid = req.user.uid; // from your requireAuth middleware

  try {
    // look up DB user ID for the current Firebase UID
    const userRes = await pool.query(
      `SELECT id FROM users WHERE firebase_uid = $1`,
      [firebaseUid]
    );
    if (!userRes.rows.length) return res.status(403).json({ error: 'User not found' });
    const myId = userRes.rows[0].id;

    // verify ownership
    const projRes = await pool.query(
      `SELECT owner_id FROM projects WHERE project_url = $1`,
      [projectUrl]
    );
    if (!projRes.rows.length) return res.status(404).json({ error: 'Project not found' });
    if (projRes.rows[0].owner_id !== myId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // perform update
    await pool.query(
      `UPDATE projects
          SET project_name = $1,
              project_key  = $2,
              owner_id     = $3,
              updated_at   = now()
        WHERE project_url = $4`,
      [project_name, project_key, owner_id, projectUrl]
    );

    res.json({ message: 'Project updated' });
  } catch (err) {
    console.error('editProjectController error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
