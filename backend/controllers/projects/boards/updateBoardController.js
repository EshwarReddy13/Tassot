import pool from '../../../db.js';
import { logActivity } from '../../../services/activityLogger.js';

export const updateBoardController = async (req, res) => {
  const { boardId } = req.params;
  const { name } = req.body;
  const { id: userId } = req.user;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Board name cannot be empty.' });
  }

  try {
    const oldBoardResult = await pool.query('SELECT project_id, name FROM boards WHERE id = $1', [boardId]);
    if (oldBoardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found.' });
    }
    const { project_id: projectId, name: oldName } = oldBoardResult.rows[0];

    const { rows } = await pool.query(
      'UPDATE boards SET name = $1 WHERE id = $2 RETURNING id, name, position',
      [name.trim(), boardId]
    );

    const updatedBoard = rows[0];

    if (oldName !== updatedBoard.name) {
      logActivity({
        projectId: projectId,
        userId: userId,
        primaryEntityType: 'board',
        primaryEntityId: updatedBoard.name, // Log with the new name
        actionType: 'update',
        changeData: { field: 'name', from: oldName, to: updatedBoard.name }
      });
    }

    res.status(200).json(updatedBoard);

  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};