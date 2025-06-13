import pool from '../../../db.js';

export const deleteTaskController = async (req, res) => {
  const { projectUrl, taskId } = req.params;
  const { id: userId } = req.user; // User's database ID from auth middleware

  if (!taskId) {
    return res.status(400).json({ error: 'Task ID is required.' });
  }

  try {
    // 1. Find the project and verify the current user is the owner.
    // This query joins from the task up to the project to find the owner.
    const ownerCheckQuery = `
      SELECT p.owner_id
      FROM tasks t
      JOIN boards b ON t.board_id = b.id
      JOIN projects p ON b.project_id = p.id
      WHERE t.id = $1 AND p.project_url = $2;
    `;
    const ownerCheckResult = await pool.query(ownerCheckQuery, [taskId, projectUrl]);

    if (ownerCheckResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found in this project.' });
    }

    const { owner_id } = ownerCheckResult.rows[0];

    // 2. SECURITY CHECK: Ensure the user ID from the token matches the project owner's ID.
    if (owner_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can delete tasks.' });
    }

    // 3. If authorized, delete the task.
    const deleteQuery = 'DELETE FROM tasks WHERE id = $1 RETURNING id;';
    const deleteResult = await pool.query(deleteQuery, [taskId]);

    if (deleteResult.rowCount === 0) {
      // This case is unlikely if the owner check passed, but good for safety.
      return res.status(404).json({ error: 'Task not found.' });
    }

    // A 204 No Content response is standard for successful deletions.
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};