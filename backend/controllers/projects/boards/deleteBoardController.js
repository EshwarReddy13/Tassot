import pool from '../../../db.js';

export const deleteBoardController = async (req, res) => {
    const { boardId } = req.params;

    // The 'requireProjectRole' middleware has already confirmed that the user
    // is an 'owner' or 'editor' of this project. No further role checks are needed here.
    
    if (!boardId) {
        return res.status(400).json({ error: 'Board ID is required.' });
    }

    try {
        // Your database schema's "ON DELETE CASCADE" on the tasks table
        // means that deleting a board will automatically delete all of its tasks.
        const deleteResult = await pool.query(
            'DELETE FROM boards WHERE id = $1 RETURNING id;',
            [boardId]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: 'Board not found.' });
        }

        // Standard "Success, No Content" response for deletions.
        res.status(204).send();

    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ error: 'Internal server error while deleting board.' });
    }
};