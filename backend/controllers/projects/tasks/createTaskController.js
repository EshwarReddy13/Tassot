import pool from '../../../db.js';

// Helper function to generate the next task key (e.g., PROJ-1, PROJ-2)
const generateNextTaskKey = async (projectId) => {
  // First, get the project_key from the projects table
  const projectResult = await pool.query(
    'SELECT project_key FROM projects WHERE id = $1',
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    throw new Error('Project not found');
  }
  const projectKey = projectResult.rows[0].project_key;

  // Then, find the highest existing task number for this project
  const result = await pool.query(
    `SELECT task_key FROM tasks
     WHERE board_id IN (SELECT id FROM boards WHERE project_id = $1)`,
    [projectId]
  );
  
  let maxNum = 0;
  if (result.rows.length > 0) {
    result.rows.forEach(row => {
      const match = row.task_key.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
  }

  return `${projectKey}-${maxNum + 1}`;
};

export const createTaskController = async (req, res) => {
  const { boardId } = req.params;
  const { task_name } = req.body;
  // Note: Your original file used firebase_uid, this version uses the database ID
  const { id: userId } = req.user; 

  if (!task_name || !task_name.trim()) {
    return res.status(400).json({ error: 'Task name cannot be empty.' });
  }

  try {
    // 1. Get the project ID and the board name from the board
    const boardResult = await pool.query(
      `SELECT project_id, name as board_name
       FROM boards
       WHERE id = $1`,
      [boardId]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found.' });
    }
    const { project_id, board_name } = boardResult.rows[0];

    // 2. Generate a task_key for the project (old method)
    const task_key = await generateNextTaskKey(project_id);

    // 3. Insert the new task
    const newTaskResult = await pool.query(
      `INSERT INTO tasks (board_id, task_key, task_name, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [boardId, task_key, task_name.trim(), board_name, userId]
    );

    res.status(201).json(newTaskResult.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};