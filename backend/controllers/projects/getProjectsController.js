// src/controllers/project/getProjectsController.js
import pool from '../../db.js'; // Adjust path to your PostgreSQL pool instance

/**
 * @description Fetch all projects associated with the authenticated user
 * @route GET /api/projects
 * @access Private (Requires Authentication)
 */
export const getProjectsController = async (req, res) => {
  // Assumes authentication middleware has run and attached user info (esp. PostgreSQL user ID) to req.user
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const userId = req.user.id; // The PostgreSQL UUID of the logged-in user

  try {
    const query = `
      SELECT
        p.id,
        p.project_key AS "projectKey",
        p.project_name AS "projectName",
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt"
      FROM projects p
      JOIN project_users pu ON p.id = pu.project_id
      WHERE pu.user_id = $1
      ORDER BY p.created_at DESC;
    `;
    // Note: Selecting specific columns and aliasing them to camelCase (e.g., "projectKey")
    // makes it easier to work with the data directly on the frontend.

    const { rows } = await pool.query(query, [userId]);

    // Return the array of projects (will be empty if user has no projects)
    res.status(200).json(rows);

  } catch (err) {
    console.error('Error fetching user projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects due to server error.' });
  }
  // No need for client.release() if pool.query is used directly (it handles release)
};