import pool from '../../../db.js';
import { logActivity } from '../../../services/activityLogger.js';

export const deleteTaskController = async (req, res) => {
  const { taskId } = req.params;
  const { id: userId } = req.user;

  if (!taskId) {
    return res.status(400).json({ error: 'Task ID is required.' });
  }

  try {
    const taskDataResult = await pool.query(
      'SELECT t.task_key, b.project_id FROM tasks t JOIN boards b ON t.board_id = b.id WHERE t.id = $1', 
      [taskId]
    );

    if (taskDataResult.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    const { task_key, project_id } = taskDataResult.rows[0];

    const deleteResult = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id;', [taskId]);

    if (deleteResult.rowCount > 0) {
        logActivity({
            projectId: project_id,
            userId: userId,
            primaryEntityType: 'task',
            primaryEntityId: task_key,
            actionType: 'delete'
        });
    }

    res.status(204).send();

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};