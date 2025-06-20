import pool from '../../../db.js';

export const updateBoardController = async (req, res) => {
  const { boardId } = req.params;
  const { name } = req.body;
  // const { id: userId } = req.user; // No longer needed for permission checks here

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Board name cannot be empty.' });
  }

  try {
    // The 'requireProjectRole' middleware has already verified the user is an owner or editor.
    // We can proceed directly with the update.
    
    const { rows } = await pool.query(
      'UPDATE boards SET name = $1 WHERE id = $2 RETURNING id, name, position',
      [name.trim(), boardId]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Board not found.' });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};