import pool from '../../../db.js';

export const updateBoardController = async (req, res) => {
  const { projectUrl, boardId } = req.params;
  const { name } = req.body;
  const { id: userId } = req.user;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Board name cannot be empty.' });
  }

  try {
    // 1. Verify ownership before allowing an update.
    const ownerCheckQuery = `
      SELECT p.owner_id
      FROM projects p
      JOIN boards b ON p.id = b.project_id
      WHERE b.id = $1 AND p.project_url = $2;
    `;
    const ownerCheckResult = await pool.query(ownerCheckQuery, [boardId, projectUrl]);

    if (ownerCheckResult.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found in this project.' });
    }

    const { owner_id } = ownerCheckResult.rows[0];

    // 2. Security Check: Only owners can rename boards.
    if (owner_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can update boards.' });
    }

    // 3. If authorized, update the board name.
    const { rows } = await pool.query(
      'UPDATE boards SET name = $1 WHERE id = $2 RETURNING id, name, position',
      [name.trim(), boardId]
    );

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};