import pool from '../../../db.js';
import { logActivity } from '../../../services/activityLogger.js';

// Re-using the task key generation logic from a previous file for consistency
const generateNextTaskKey = async (client, projectId) => {
    const projectResult = await client.query('SELECT project_key FROM projects WHERE id = $1', [projectId]);
    if (projectResult.rows.length === 0) throw new Error('Project not found for key generation');
    const projectKey = projectResult.rows[0].project_key;

    // We must count all tasks, not just within a specific board, to get a project-wide unique number.
    const result = await client.query(`SELECT COUNT(*) FROM tasks t JOIN boards b ON t.board_id = b.id WHERE b.project_id = $1`, [projectId]);
    
    // The next task number is always the current count + 1.
    const taskNumber = parseInt(result.rows[0].count, 10) + 1;
    return `${projectKey}-${taskNumber}`;
};

export const createTaskController = async (req, res) => {
    // Note: The boardId is now in the body, which is more flexible.
    const { board_id, task_name, description, deadline, assigneeIds } = req.body;
    const { id: userId } = req.user;

    if (!task_name || !task_name.trim()) {
        return res.status(400).json({ error: 'Task name is required.' });
    }
    if (!board_id) {
        return res.status(400).json({ error: 'Board ID is required to create a task.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get board and project context
        const boardResult = await client.query(`SELECT project_id, name as board_name FROM boards WHERE id = $1`, [board_id]);
        if (boardResult.rows.length === 0) {
            throw new Error('Board not found.');
        }
        const { project_id, board_name } = boardResult.rows[0];

        // Generate the new task key
        const task_key = await generateNextTaskKey(client, project_id);

        // Insert the new task
        const taskInsertQuery = `
            INSERT INTO tasks (board_id, task_key, task_name, status, created_by, description, deadline)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const taskValues = [board_id, task_key, task_name.trim(), board_name, userId, description || null, deadline || null];
        const newTaskResult = await client.query(taskInsertQuery, taskValues);
        const newTask = newTaskResult.rows[0];

        // Insert assignees if provided
        if (assigneeIds && assigneeIds.length > 0) {
            const assigneeInsertPromises = assigneeIds.map(assigneeId => {
                const query = 'INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)';
                return client.query(query, [newTask.id, assigneeId]);
            });
            await Promise.all(assigneeInsertPromises);
        }

        await client.query('COMMIT');
        
        // --- LOG THE ACTIVITY ---
        // This is done after the commit to ensure the action was successful.
        // It's "fire-and-forget" so it doesn't slow down the user's response.
        logActivity({
          projectId: project_id,
          userId: userId,
          primaryEntityType: 'task',
          primaryEntityId: newTask.task_key, // Using the human-readable key is best
          actionType: 'create'
        });
        // ------------------------

        // To provide a complete response, fetch the newly created full task data with assignees
        const finalTaskQuery = `
          SELECT t.*,
            (SELECT json_agg(a_agg) FROM 
                (SELECT u.id, u.first_name, u.last_name, u.photo_url FROM users u JOIN task_assignees ta ON u.id = ta.user_id WHERE ta.task_id = t.id) 
             AS a_agg) as assignees
          FROM tasks t WHERE t.id = $1
        `;
        const finalResult = await client.query(finalTaskQuery, [newTask.id]);

        res.status(201).json(finalResult.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task.' });
    } finally {
        client.release();
    }
};