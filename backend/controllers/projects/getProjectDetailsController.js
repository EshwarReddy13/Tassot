import pool from '../../db.js';

export const getProjectDetailsController = async (req, res) => {
  const { projectUrl } = req.params;
  const { id: userId } = req.user; // Use the PostgreSQL UUID from our corrected auth middleware

  if (!userId) {
    return res.status(401).json({ error: 'User ID not found in token.' });
  }

  try {
    const query = `
      SELECT
        p.id AS project_id,
        p.project_url,
        p.project_key,
        p.project_name,
        p.owner_id,
        (
          SELECT json_agg(b_agg)
          FROM (
            SELECT b.id, b.name, b.position
            FROM boards b
            WHERE b.project_id = p.id
            ORDER BY b.position
          ) AS b_agg
        ) AS boards,
        (
          SELECT json_agg(t_agg)
          FROM (
            SELECT t.id, t.board_id, t.task_key, t.task_name, t.status, t.notes, t.created_at, t.created_by -- THIS IS THE FIX
            FROM tasks t
            JOIN boards b ON t.board_id = b.id
            WHERE b.project_id = p.id
          ) AS t_agg
        ) AS tasks
      FROM
        projects p
      JOIN
        project_users pu ON p.id = pu.project_id
      WHERE
        p.project_url = $1 AND pu.user_id = $2;
    `;

    const { rows } = await pool.query(query, [projectUrl, userId]);

    if (rows.length === 0) {
      // This is the error you are seeing. It triggers if the user doesn't have access.
      return res.status(404).json({ error: 'Project not found or you do not have access.' });
    }

    const projectData = rows[0];

    // The SQL query returns a single object. We'll format it for the frontend.
    const responsePayload = {
      project: {
        id: projectData.project_id,
        project_url: projectData.project_url,
        project_key: projectData.project_key,
        project_name: projectData.project_name,
        owner_id: projectData.owner_id,
      },
      // Use COALESCE logic to ensure boards/tasks are always an array, even if null.
      boards: projectData.boards || [],
      tasks: projectData.tasks || [],
    };

    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ error: 'Internal server error while fetching project details.' });
  }
};