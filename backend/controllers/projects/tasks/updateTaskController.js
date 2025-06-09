import pool from '../../../db.js';

export const updateTaskController = async (req, res) => {
  const { projectUrl, taskId } = req.params;
  const { task_name, notes, board_id, status } = req.body;
  // THE FIX IS HERE: We get the user's DATABASE id directly from our smart middleware.
  const { id: userId } = req.user;

  // Basic validation
  if (task_name === undefined && notes === undefined && board_id === undefined && status === undefined) {
    return res.status(400).json({ error: 'No update data provided.' });
  }

  try {
    // 1. Verify user is a member of the project and that the task belongs to the project.
    //    We now correctly check against users.id instead of firebase_uid.
    const validationQuery = `
      SELECT t.id AS task_id, p.id AS project_id
      FROM tasks t
      JOIN boards b ON t.board_id = b.id
      JOIN projects p ON b.project_id = p.id
      JOIN project_users pu ON p.id = pu.project_id
      JOIN users u ON pu.user_id = u.id
      WHERE t.id = $1 AND p.project_url = $2 AND u.id = $3;
    `;
    const validationResult = await pool.query(validationQuery, [taskId, projectUrl, userId]);

    if (validationResult.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this task or it does not exist.' });
    }

    const { project_id } = validationResult.rows[0];

    // 2. If board_id is being changed, verify the new board belongs to the same project
    if (board_id) {
        const boardCheckResult = await pool.query(
            'SELECT id FROM boards WHERE id = $1 AND project_id = $2',
            [board_id, project_id]
        );
        if (boardCheckResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid board. The specified board does not belong to this project.' });
        }
    }

    // 3. Construct the dynamic UPDATE query
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (task_name !== undefined) {
      fields.push(`task_name = $${queryIndex++}`);
      values.push(task_name);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${queryIndex++}`);
      values.push(notes);
    }
    if (board_id !== undefined) {
      fields.push(`board_id = $${queryIndex++}`);
      values.push(board_id);
    }
    if (status !== undefined) {
      fields.push(`status = $${queryIndex++}`);
      values.push(status);
    }
    
    values.push(taskId); // For the WHERE clause

    const updateQuery = `
      UPDATE tasks 
      SET ${fields.join(', ')} 
      WHERE id = $${queryIndex}
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, values);
    
    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};