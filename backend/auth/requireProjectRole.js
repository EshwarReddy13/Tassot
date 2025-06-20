import pool from '../db.js';

/**
 * Middleware generator to enforce role-based access control for project-specific routes.
 * @param {string[]} allowedRoles - An array of roles that are allowed to access the route (e.g., ['owner', 'editor']).
 * @returns {function} An Express middleware function.
 */
export const requireProjectRole = (allowedRoles) => {
    return async (req, res, next) => {
        const { projectUrl } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication is required.' });
        }
        if (!projectUrl) {
            return res.status(400).json({ error: 'Project URL is missing from the request path.' });
        }

        try {
            const query = `
                SELECT pu.role
                FROM project_users pu
                JOIN projects p ON pu.project_id = p.id
                WHERE p.project_url = $1 AND pu.user_id = $2;
            `;

            const { rows } = await pool.query(query, [projectUrl, userId]);

            if (rows.length === 0) {
                return res.status(403).json({ error: 'Forbidden: You are not a member of this project.' });
            }

            const userRole = rows[0].role;

            if (allowedRoles.includes(userRole)) {
                // Attach role to request object for potential use in the controller
                req.projectRole = userRole; 
                next(); // User has permission, proceed.
            } else {
                return res.status(403).json({ error: 'Forbidden: You do not have sufficient permissions for this action.' });
            }

        } catch (error) {
            console.error('Authorization middleware error:', error);
            return res.status(500).json({ error: 'Internal server error during authorization.' });
        }
    };
};