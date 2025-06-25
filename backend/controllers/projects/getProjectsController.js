import pool from '../../db.js';

export const getProjectsController = async (req, res) => {
  const userId = req.user.id; // from your requireAuth middleware

  try {
    const { rows } = await pool.query(
      `SELECT p.id,
              p.project_url,
              p.project_key,
              p.project_name,
              p.owner_id,
              p.created_at,
              pu.is_pinned,
              pu.sort_order
         FROM projects p
    INNER JOIN project_users pu
            ON pu.project_id = p.id
        WHERE pu.user_id = $1
          AND pu.project_id IS NOT NULL
     ORDER BY pu.is_pinned DESC, pu.sort_order ASC NULLS LAST, p.created_at DESC`,
      [userId]
    );

    const projects = rows.map(r => ({
      id:           r.id,
      projectUrl:   r.project_url,
      projectKey:   r.project_key,
      projectName:  r.project_name,
      ownerId:      r.owner_id,
      createdAt:    r.created_at,
      isPinned:     r.is_pinned,
      sortOrder:    r.sort_order
    }));

    res.json(projects);
  } catch (err) {
    console.error('getProjectsController error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
