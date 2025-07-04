import pool from '../../../db.js';

export const getMyTasksController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(`
      SELECT t.*, ta.added_at, ta.user_id, ta.task_id
      FROM task_assignees ta
      JOIN tasks t ON t.id = ta.task_id
      WHERE ta.user_id = $1
      ORDER BY t.deadline ASC NULLS LAST
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error in getMyTasksController:', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
}; 