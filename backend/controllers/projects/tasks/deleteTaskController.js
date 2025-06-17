import pool from '../../../db.js';

export const deleteTaskController = async (req, res) => {
  const { taskId } = req.params;

  // The 'requireProjectRole' middleware (set to ['owner', 'editor', 'user'] in projectRoutes.js)
  // has already verified the user has sufficient permission to be here.
  // We can now proceed directly with the deletion logic.

  if (!taskId) {
    return res.status(400).json({ error: 'Task ID is required.' });
  }

  try {
    const deleteQuery = 'DELETE FROM tasks WHERE id = $1 RETURNING id;';
    const deleteResult = await pool.query(deleteQuery, [taskId]);

    if (deleteResult.rowCount === 0) {
      // This can happen if the task was deleted by someone else just moments ago.
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Success with No Content is the standard for successful DELETE operations.
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};