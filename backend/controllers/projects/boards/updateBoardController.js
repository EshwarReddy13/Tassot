import pool from '../../../db.js';
import { logActivity } from '../../../services/activityLogger.js';

export const updateBoardController = async (req, res) => {
  const { boardId } = req.params;
  const { name, color } = req.body; // <-- DESTRUCTURE name and color
  const { id: userId } = req.user;

  // --- VALIDATION ---
  if ((!name || !name.trim()) && !color) {
    return res.status(400).json({ error: 'Board name or color is required.' });
  }
  // Optional: Validate color format if provided
  if (color && !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return res.status(400).json({ error: 'Invalid color format. Use hex code.' });
  }

  try {
    const oldBoardResult = await pool.query('SELECT project_id, name, color FROM boards WHERE id = $1', [boardId]);
    if (oldBoardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found.' });
    }
    const { project_id: projectId, name: oldName, color: oldColor } = oldBoardResult.rows[0];

    // --- DYNAMIC QUERY BUILDING ---
    const fieldsToUpdate = [];
    const values = [];
    let queryIndex = 1;

    if (name && name.trim()) {
      fieldsToUpdate.push(`name = $${queryIndex++}`);
      values.push(name.trim());
    }

    if (color) {
      fieldsToUpdate.push(`color = $${queryIndex++}`);
      values.push(color);
    }
    
    values.push(boardId); // For the WHERE clause

    const updateQuery = `
      UPDATE boards 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = $${queryIndex} 
      RETURNING *`;

    const { rows } = await pool.query(updateQuery, values);
    const updatedBoard = rows[0];

    // --- ACTIVITY LOGGING ---
    const changes = [];
    if (name && oldName !== updatedBoard.name) {
      changes.push({ field: 'name', from: oldName, to: updatedBoard.name });
    }
    if (color && oldColor !== updatedBoard.color) {
      changes.push({ field: 'color', from: oldColor, to: updatedBoard.color });
    }

    if (changes.length > 0) {
      logActivity({
        projectId: projectId,
        userId: userId,
        primaryEntityType: 'board',
        primaryEntityId: updatedBoard.id, // Log with ID
        actionType: 'update',
        changeData: changes
      });
    }

    res.status(200).json(updatedBoard);

  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};