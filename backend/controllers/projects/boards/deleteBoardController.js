import pool from '../../../db.js';
import { logActivity } from '../../../services/activityLogger.js';

export const deleteBoardController = async (req, res) => {
    const { boardId } = req.params;
    const { id: userId } = req.user;

    if (!boardId) {
        return res.status(400).json({ error: 'Board ID is required.' });
    }

    try {
        // We must fetch the board details BEFORE deleting to have something to log
        const boardDataResult = await pool.query('SELECT project_id, name FROM boards WHERE id = $1', [boardId]);
        
        if (boardDataResult.rowCount === 0) {
            return res.status(404).json({ error: 'Board not found.' });
        }
        const { project_id, name } = boardDataResult.rows[0];

        const deleteResult = await pool.query('DELETE FROM boards WHERE id = $1 RETURNING id;', [boardId]);

        if (deleteResult.rowCount > 0) {
            logActivity({
                projectId: project_id,
                userId: userId,
                primaryEntityType: 'board',
                primaryEntityId: name,
                actionType: 'delete'
            });
        }

        res.status(204).send();

    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ error: 'Internal server error while deleting board.' });
    }
};