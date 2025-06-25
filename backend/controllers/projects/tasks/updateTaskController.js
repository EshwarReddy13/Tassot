import pool from '../../../db.js';
import { logActivity } from '../../../services/activityLogger.js';

export const updateTaskController = async (req, res) => {
    const { projectUrl, taskId } = req.params;
    const { task_name, description, board_id, deadline, assigneeIds } = req.body;
    const { id: userId } = req.user;

    if ([task_name, description, board_id, deadline, assigneeIds].every(field => field === undefined)) {
        return res.status(400).json({ error: 'No update data provided.' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Fetch the "before" state of the task for comparison
        const oldTaskQuery = `
          SELECT 
            t.*, b.project_id,
            ARRAY(SELECT user_id FROM task_assignees WHERE task_id = t.id) as old_assignees
          FROM tasks t
          JOIN boards b ON t.board_id = b.id
          WHERE t.id = $1
        `;
        const oldTaskResult = await client.query(oldTaskQuery, [taskId]);
        if (oldTaskResult.rows.length === 0) {
          throw new Error('Task not found.');
        }
        const oldTask = oldTaskResult.rows[0];
        const projectId = oldTask.project_id;
        
        // --- Handle Assignee Updates ---
        if (assigneeIds !== undefined) {
            // Log additions and removals
            const oldSet = new Set(oldTask.old_assignees.map(String));
            const newSet = new Set(assigneeIds.map(String));
            const added = assigneeIds.filter(id => !oldSet.has(String(id)));
            const removed = oldTask.old_assignees.filter(id => !newSet.has(String(id)));
            
            for(const assigneeId of added) { logActivity({ projectId, userId, primaryEntityType: 'task', primaryEntityId: oldTask.task_key, actionType: 'assign', changeData: { assigned_user_id: assigneeId } }); }
            for(const assigneeId of removed) { logActivity({ projectId, userId, primaryEntityType: 'task', primaryEntityId: oldTask.task_key, actionType: 'unassign', changeData: { unassigned_user_id: assigneeId } }); }
            
            await client.query('DELETE FROM task_assignees WHERE task_id = $1', [taskId]);
            if (assigneeIds.length > 0) {
                for (const assigneeId of assigneeIds) {
                    await client.query('INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)', [taskId, assigneeId]);
                }
            }
        }
        
        // --- Handle Field Updates ---
        const fields = [];
        const values = [];
        let queryIndex = 1;

        if (task_name !== undefined && oldTask.task_name !== task_name) { fields.push(`task_name = $${queryIndex++}`); values.push(task_name); logActivity({ projectId, userId, primaryEntityType: 'task', primaryEntityId: oldTask.task_key, actionType: 'update', changeData: { field: 'name', from: oldTask.task_name, to: task_name } });}
        if (description !== undefined && oldTask.description !== description) { fields.push(`description = $${queryIndex++}`); values.push(description); logActivity({ projectId, userId, primaryEntityType: 'task', primaryEntityId: oldTask.task_key, actionType: 'update', changeData: { field: 'description' } }); }
        if (deadline !== undefined && new Date(oldTask.deadline).toISOString() !== new Date(deadline).toISOString()) { fields.push(`deadline = $${queryIndex++}`); values.push(deadline || null); logActivity({ projectId, userId, primaryEntityType: 'task', primaryEntityId: oldTask.task_key, actionType: 'update', changeData: { field: 'deadline', from: oldTask.deadline, to: deadline || null } }); }

        // --- Handle Board/Status Move ---
        if (board_id !== undefined && oldTask.board_id !== board_id) {
            const newBoardResult = await client.query('SELECT name FROM boards WHERE id = $1', [board_id]);
            if (newBoardResult.rows.length === 0) throw new Error('Target board not found');
            const newStatus = newBoardResult.rows[0].name;

            fields.push(`board_id = $${queryIndex++}`); values.push(board_id);
            fields.push(`status = $${queryIndex++}`); values.push(newStatus);
            
            logActivity({ projectId, userId, primaryEntityType: 'task', primaryEntityId: oldTask.task_key, actionType: 'move', changeData: { from: oldTask.status, to: newStatus } });
        }
        
        // Execute the final update query if there are any field changes
        if (fields.length > 0) {
            values.push(taskId);
            await client.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
        }

        await client.query('COMMIT');
        
        // Fetch the fully updated task to return
        const finalTaskQuery = `SELECT t.*, (SELECT json_agg(u.*) FROM users u JOIN task_assignees ta ON u.id = ta.user_id WHERE ta.task_id = t.id) as assignees FROM tasks t WHERE t.id = $1`;
        const finalResult = await client.query(finalTaskQuery, [taskId]);

        res.status(200).json(finalResult.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating task:', error.message);
        res.status(500).json({ error: error.message || 'Internal server error' });
    } finally {
        client.release();
    }
};