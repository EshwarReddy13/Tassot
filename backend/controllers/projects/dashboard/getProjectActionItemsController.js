import pool from '../../../db.js';

export const getProjectActionItemsController = async (req, res) => {
  const { projectUrl } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const actionItemsQuery = `
      SELECT
          p.id,
          (
              SELECT json_agg(deadlines_agg)
              FROM (
                  SELECT t.id, t.task_key, t.task_name, t.deadline
                  FROM tasks t JOIN boards b ON t.board_id = b.id
                  WHERE b.project_id = p.id 
                    AND t.status <> 'Done' 
                    AND t.deadline BETWEEN now() AND now() + interval '7 day'
                  ORDER BY t.deadline ASC
              ) as deadlines_agg
          ) AS "upcomingDeadlines",
          (
              SELECT json_agg(my_tasks_agg)
              FROM (
                  SELECT t.id, t.task_key, t.task_name, t.status
                  FROM tasks t
                  JOIN task_assignees ta ON t.id = ta.task_id
                  JOIN boards b ON t.board_id = b.id
                  WHERE b.project_id = p.id 
                    AND ta.user_id = $2 -- Using parameterized query for current user ID
                    AND t.status <> 'Done'
                  ORDER BY t.created_at DESC
              ) as my_tasks_agg
          ) AS "myTasks"
      FROM projects p
      WHERE p.project_url = $1;
    `;
    
    const { rows } = await pool.query(actionItemsQuery, [projectUrl, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const result = rows[0];

    const responsePayload = {
      upcomingDeadlines: result.upcomingDeadlines || [],
      myTasks: result.myTasks || [],
    };
    
    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('Error in getProjectActionItemsController:', error);
    res.status(500).json({ error: 'Internal server error while fetching action items.' });
  }
};