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
  // We look for tasks associated with any board within the given project.
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
  const { firebase_uid } = req.user;

  if (!task_name || !task_name.trim()) {
    return res.status(400).json({ error: 'Task name cannot be empty.' });
  }

  try {
    // 1. Get the internal user ID and the project ID from the board
    const boardResult = await pool.query(
      `SELECT b.project_id, b.name as board_name, u.id as user_id
       FROM boards b, users u
       WHERE b.id = $1 AND u.firebase_uid = $2`,
      [boardId, firebase_uid]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found or user not authenticated.' });
    }
    const { project_id, board_name, user_id } = boardResult.rows[0];

    // 2. Generate a unique task_key for the project
    const task_key = await generateNextTaskKey(project_id);

    // 3. Insert the new task
    const newTaskResult = await pool.query(
      `INSERT INTO tasks (board_id, task_key, task_name, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, board_id, task_key, task_name, status, notes, created_at`,
      [boardId, task_key, task_name.trim(), board_name, user_id]
    );

    res.status(201).json(newTaskResult.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

