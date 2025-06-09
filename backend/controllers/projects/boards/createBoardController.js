import pool from '../../../db.js';

export const createBoardController = async (req, res) => {
  // **FIX**: Use the consistent 'projectUrl' parameter name
  const { projectUrl } = req.params; 
  const { name } = req.body;
  const { firebase_uid } = req.user;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Board name cannot be empty.' });
  }

  try {
    // First, verify the user has access to the project and get the project ID.
    const projectResult = await pool.query(
      `SELECT p.id
       FROM projects p
       JOIN project_users pu ON p.id = pu.project_id
       JOIN users u ON pu.user_id = u.id
       WHERE p.project_url = $1 AND u.firebase_uid = $2`,
      [projectUrl, firebase_uid]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or you do not have access.' });
    }
    const projectId = projectResult.rows[0].id;

    // Get the highest current position to place the new board at the end.
    const positionResult = await pool.query(
        'SELECT MAX(position) as max_position FROM boards WHERE project_id = $1',
        [projectId]
    );
    const newPosition = (positionResult.rows[0].max_position || -1) + 1;

    // Insert the new board.
    const newBoardResult = await pool.query(
      `INSERT INTO boards (project_id, name, position)
       VALUES ($1, $2, $3)
       RETURNING id, name, position`,
      [projectId, name.trim(), newPosition]
    );

    res.status(201).json(newBoardResult.rows[0]);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board.' });
  }
};