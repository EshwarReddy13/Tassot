import pool from '../../db.js';

export const getProjectDetailsController = async (req, res) => {
  // DEBUGGING: Log when the controller is hit
  console.log('\n--- [Controller] getProjectDetailsController Initiated ---');

  const { projectUrl } = req.params;
  // DEBUGGING: Log the incoming parameters
  console.log(`[Controller] projectUrl from params: "${projectUrl}"`);

  // This is the most important log. We need to see if req.user exists and has the right ID.
  console.log('[Controller] User from auth middleware:', req.user);
  
  const userId = req.user?.id;

  if (!userId) {
    console.log('[Controller] ABORT: User ID not found in req.user. Sending 401.');
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
            SELECT t.id, t.board_id, t.task_key, t.task_name, t.status, t.notes, t.created_at, t.created_by
            FROM tasks t
            JOIN boards b ON t.board_id = b.id
            WHERE b.project_id = p.id
          ) AS t_agg
        ) AS tasks,
        (
          SELECT json_agg(m_agg)
          FROM (
            SELECT u.id, u.first_name, u.last_name, u.photo_url
            FROM users u
            JOIN project_users pu_mem ON u.id = pu_mem.user_id
            WHERE pu_mem.project_id = p.id
          ) AS m_agg
        ) AS members
      FROM
        projects p
      JOIN
        project_users pu ON p.id = pu.project_id
      WHERE
        p.project_url = $1 AND pu.user_id = $2;
    `;

    // DEBUGGING: Log the query parameters being sent to the database
    console.log('[Controller] Executing query with params:', { projectUrl, userId });

    const { rows } = await pool.query(query, [projectUrl, userId]);

    // DEBUGGING: Log the result from the database
    console.log(`[Controller] Database query returned ${rows.length} row(s).`);

    if (rows.length === 0) {
      console.log('[Controller] No project found or user lacks access. Sending 404.');
      return res.status(404).json({ error: 'Project not found or you do not have access.' });
    }

    const projectData = rows[0];
    const responsePayload = {
      project: {
        id: projectData.project_id,
        project_url: projectData.project_url,
        project_key: projectData.project_key,
        project_name: projectData.project_name,
        owner_id: projectData.owner_id,
      },
      boards: projectData.boards || [],
      tasks: projectData.tasks || [],
      members: projectData.members || [],
    };

    console.log('[Controller] Success. Sending 200 with payload.');
    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('[Controller] CRITICAL ERROR:', error);
    res.status(500).json({ error: 'Internal server error while fetching project details.' });
  }
};