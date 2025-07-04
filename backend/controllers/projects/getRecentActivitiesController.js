import pool from '../../db.js';

export const getRecentActivitiesController = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get all project IDs the user is a member of
    const { rows: projectRows } = await pool.query(
      'SELECT project_id FROM project_users WHERE user_id = $1',
      [userId]
    );
    const projectIds = projectRows.map(r => r.project_id);
    if (projectIds.length === 0) return res.json([]);
    // Get recent activities for those projects
    const { rows } = await pool.query(
      `SELECT * FROM activities WHERE project_id = ANY($1) ORDER BY created_at DESC LIMIT 20`,
      [projectIds]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in getRecentActivitiesController:', err);
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
}; 