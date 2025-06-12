// src/controllers/projects/deleteProjectController.js
import pool from '../../db.js';

export const deleteProjectController = async (req, res) => {
  const { projectUrl } = req.params;
  const firebaseUid = req.user.uid;

  try {
    // find DB user ID
    const userRes = await pool.query(
      `SELECT id FROM users WHERE firebase_uid = $1`,
      [firebaseUid]
    );
    if (!userRes.rows.length) return res.status(403).json({ error: 'User not found' });
    const myId = userRes.rows[0].id;

    // verify ownership
    const projRes = await pool.query(
      `SELECT owner_id, id FROM projects WHERE project_url = $1`,
      [projectUrl]
    );
    if (!projRes.rows.length) return res.status(404).json({ error: 'Project not found' });
    if (projRes.rows[0].owner_id !== myId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // delete (cascades to project_users, boards, tasks)
    await pool.query(
      `DELETE FROM projects WHERE project_url = $1`,
      [projectUrl]
    );

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('deleteProjectController error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
