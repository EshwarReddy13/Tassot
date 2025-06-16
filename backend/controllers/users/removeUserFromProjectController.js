import pool from '../../db.js';

export const removeUserFromProjectController = async (req, res) => {
    const { projectUrl, memberId } = req.params;
    const { id: requesterId } = req.user; // The person making the request

    // --- Validation ---
    if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required.' });
    }

    try {
        // --- Get Project ID and Owner ID from the projectUrl ---
        const projectResult = await pool.query(
            'SELECT id, owner_id FROM projects WHERE project_url = $1',
            [projectUrl]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        const { id: projectId, owner_id: ownerId } = projectResult.rows[0];
        
        // --- Security Check 1: Only the project owner can perform this action ---
        if (ownerId !== requesterId) {
            return res.status(403).json({ error: 'Forbidden: Only the project owner can remove members.' });
        }
        
        // --- Security Check 2: The owner cannot remove themselves ---
        if (ownerId === memberId) {
            return res.status(400).json({ error: 'Project owner cannot be removed from their own project.' });
        }
        
        // --- If all checks pass, delete the user's link to the project ---
        const deleteResult = await pool.query(
            'DELETE FROM project_users WHERE project_id = $1 AND user_id = $2',
            [projectId, memberId]
        );
        
        if (deleteResult.rowCount === 0) {
            // This can happen if the user wasn't a member in the first place.
            return res.status(404).json({ error: 'User is not a member of this project.' });
        }

        // A successful deletion returns a 204 No Content response.
        res.status(204).send();

    } catch (error) {
        console.error('Error removing user from project:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};