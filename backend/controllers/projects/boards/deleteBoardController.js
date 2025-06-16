import pool from '../../../db.js';

export const deleteBoardController = async (req, res) => {
  const { projectUrl, boardId } = req.params;
  const { id: userId } = req.user; // User's database ID from auth middleware

  if (!boardId) {
    return res.status(400).json({ error: 'Board ID is required.' });
  }

  try {
    // 1. Find the project from the board ID and verify the current user is the owner.
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

    // 2. SECURITY CHECK: Ensure the user ID from the token matches the project owner's ID.
    if (owner_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can delete boards.' });
    }

    // 3. If authorized, delete the board.
    // Your `tasks` table's ON DELETE CASCADE will automatically handle deleting associated tasks.
    await pool.query('DELETE FROM boards WHERE id = $1', [boardId]);

    // A 204 No Content response is standard for successful deletions.
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};