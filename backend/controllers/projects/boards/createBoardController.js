import pool from '../../../db.js';
import { logActivity } from '../../../services/activityLogger.js';

export const createBoardController = async (req, res) => {
  const { projectUrl } = req.params; 
  const { name } = req.body;
  const { id: userId } = req.user; // Use the Neon DB user ID

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Board name cannot be empty.' });
  }

  try {
    const projectResult = await pool.query(
      `SELECT p.id FROM projects p
       JOIN project_users pu ON p.id = pu.project_id
       WHERE p.project_url = $1 AND pu.user_id = $2`,
      [projectUrl, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or you do not have access.' });
    }
    const projectId = projectResult.rows[0].id;

    const positionResult = await pool.query('SELECT MAX(position) as max_position FROM boards WHERE project_id = $1', [projectId]);
    const newPosition = (positionResult.rows[0].max_position || -1) + 1;

    const newBoardResult = await pool.query(
      `INSERT INTO boards (project_id, name, position) VALUES ($1, $2, $3) RETURNING id, name, position`,
      [projectId, name.trim(), newPosition]
    );

    const newBoard = newBoardResult.rows[0];

    // Log the activity after successful creation
    logActivity({
      projectId: projectId,
      userId: userId,
      primaryEntityType: 'board',
      primaryEntityId: newBoard.name, // Using name is more descriptive
      actionType: 'create'
    });

    res.status(201).json(newBoard);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board.' });
  }
};