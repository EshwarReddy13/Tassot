import pool from '../../../db.js';

// Re-using the task key generation logic from your file
const generateNextTaskKey = async (projectId) => {
    const projectResult = await pool.query('SELECT project_key FROM projects WHERE id = $1', [projectId]);
    if (projectResult.rows.length === 0) throw new Error('Project not found');
    const projectKey = projectResult.rows[0].project_key;
    const result = await pool.query(`SELECT task_key FROM tasks WHERE board_id IN (SELECT id FROM boards WHERE project_id = $1)`, [projectId]);
    let maxNum = 0;
    if (result.rows.length > 0) {
        result.rows.forEach(row => {
            const match = row.task_key.match(/-(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
            }
        });
    }
    return `${projectKey}-${maxNum + 1}`;
};

export const createTaskController = async (req, res) => {
    // [MODIFIED] Destructure the new data structure
    const { board_id, task_name, description, deadline, assigneeIds } = req.body;
    const { id: userId } = req.user;

    if (!task_name || !task_name.trim()) {
        return res.status(400).json({ error: 'Task name is required.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start transaction

        const boardResult = await client.query(`SELECT project_id, name as board_name FROM boards WHERE id = $1`, [board_id]);
        if (boardResult.rows.length === 0) throw new Error('Board not found.');
        const { project_id, board_name } = boardResult.rows[0];

        const task_key = await generateNextTaskKey(project_id);

        // [MODIFIED] Base task insert query
        const taskInsertQuery = `
            INSERT INTO tasks (board_id, task_key, task_name, status, created_by, description, deadline)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const taskValues = [board_id, task_key, task_name.trim(), board_name, userId, description || null, deadline || null];
        const newTaskResult = await client.query(taskInsertQuery, taskValues);
        const newTask = newTaskResult.rows[0];

        // [NEW] If there are assignees, insert them into the new join table
        if (assigneeIds && assigneeIds.length > 0) {
            const assigneeInsertPromises = assigneeIds.map(assigneeId => {
                const query = 'INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)';
                return client.query(query, [newTask.id, assigneeId]);
            });
            await Promise.all(assigneeInsertPromises);
        }

        await client.query('COMMIT'); // Commit the transaction

        // To provide a complete response, fetch the newly created full task data
        // This is slightly inefficient but guarantees the response is correct.
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
        await client.query('ROLLBACK'); // Rollback on error
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task.' });
    } finally {
        client.release();
    }
};