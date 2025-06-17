import pool from '../../../db.js';

export const updateTaskController = async (req, res) => {
    const { projectUrl, taskId } = req.params;
    const { task_name, description, board_id, status, deadline, assigneeIds } = req.body;
    const { id: userId } = req.user;

    // This check is good practice
    if ([task_name, description, board_id, status, deadline, assigneeIds].every(field => field === undefined)) {
        return res.status(400).json({ error: 'No update data provided.' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // This validation query is correct. It ensures the user trying to update the task
        // is a member of the project that the task belongs to. The router middleware has
        // already handled the fine-grained role check.
        const validationQuery = `
          SELECT p.id AS project_id 
          FROM tasks t 
          JOIN boards b ON t.board_id = b.id 
          JOIN projects p ON b.project_id = p.id 
          JOIN project_users pu ON p.id = pu.project_id 
          WHERE t.id = $1 AND p.project_url = $2 AND pu.user_id = $3;
        `;
        const validationResult = await client.query(validationQuery, [taskId, projectUrl, userId]);
        if (validationResult.rows.length === 0) {
            // Throwing an error to be caught by the catch block is good.
            throw new Error('Forbidden: You do not have access to this task or it does not exist.');
        }

        if (assigneeIds !== undefined) {
            await client.query('DELETE FROM task_assignees WHERE task_id = $1', [taskId]);
            if (assigneeIds.length > 0) {
                // Using a loop here is perfectly fine and often clearer than map/Promise.all
                for (const assigneeId of assigneeIds) {
                    await client.query('INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)', [taskId, assigneeId]);
                }
            }
        }
        
        const fields = [];
        const values = [];
        let queryIndex = 1;
        
        if (task_name !== undefined) { fields.push(`task_name = $${queryIndex++}`); values.push(task_name); }
        if (description !== undefined) { fields.push(`description = $${queryIndex++}`); values.push(description); }
        if (board_id !== undefined) { fields.push(`board_id = $${queryIndex++}`); values.push(board_id); }
        if (status !== undefined) { fields.push(`status = $${queryIndex++}`); values.push(status); }
        if (deadline !== undefined) { fields.push(`deadline = $${queryIndex++}`); values.push(deadline || null); }

        if (fields.length > 0) {
            values.push(taskId);
            const updateQuery = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *;`;
            await client.query(updateQuery, values);
        }

        await client.query('COMMIT');
        
        // Fetch the fully updated task with its relations to return to the frontend
        const finalTaskQuery = `
          SELECT t.*,
            (SELECT json_agg(a_agg) FROM 
                (SELECT u.id, u.first_name, u.last_name, u.photo_url FROM users u JOIN task_assignees ta ON u.id = ta.user_id WHERE ta.task_id = t.id) 
             AS a_agg) as assignees
          FROM tasks t WHERE t.id = $1
        `;
        const finalResult = await client.query(finalTaskQuery, [taskId]);

        res.status(200).json(finalResult.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating task:', error.message); // Log the specific error message
        // Send the specific error message to the client
        res.status(500).json({ error: error.message || 'Internal server error' });
    } finally {
        client.release();
    }
};