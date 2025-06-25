import pool from '../../../db.js';

export const getProjectDashboardSummaryController = async (req, res) => {
  const { projectUrl } = req.params;

  try {
    const projectQuery = `
      SELECT
          p.id,
          p.project_name,
          -- This KPI remains correct
          (SELECT COUNT(*) FROM tasks t JOIN boards b ON t.board_id = b.id WHERE b.project_id = p.id) AS "totalTasks",
          
          -- Other KPIs remain correct
          (SELECT COUNT(*) FROM tasks t JOIN boards b ON t.board_id = b.id WHERE b.project_id = p.id AND t.status <> 'Done' AND t.deadline < NOW()) AS "overdueTasks",
          (SELECT COUNT(*) FROM tasks t JOIN boards b ON t.board_id = b.id LEFT JOIN task_assignees ta ON t.id = ta.task_id WHERE b.project_id = p.id AND ta.user_id IS NULL) AS "unassignedTasks",
          (SELECT COUNT(DISTINCT pu.user_id) FROM project_users pu WHERE pu.project_id = p.id) AS "totalMembers",
          
          -- --- THIS IS THE FIX ---
          -- This subquery now starts from BOARDS and LEFT JOINS tasks, ensuring all boards appear.
          (
              SELECT json_agg(stats)
              FROM (
                  SELECT 
                      b.name as status, -- The status is the board name
                      COUNT(t.id)::int as count -- COUNT(t.id) will be 0 if there are no matching tasks
                  FROM boards b
                  LEFT JOIN tasks t ON b.id = t.board_id
                  WHERE b.project_id = p.id
                  GROUP BY b.id, b.name -- Group by board to count tasks for each
                  ORDER BY b.position  -- Order by board position for a consistent chart
              ) as stats
          ) AS "taskStatusSummary"
      FROM projects p
      WHERE p.project_url = $1;
    `;

    const { rows } = await pool.query(projectQuery, [projectUrl]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const summary = rows[0];

    const responsePayload = {
      projectName: summary.project_name,
      kpis: {
        totalTasks: parseInt(summary.totalTasks, 10),
        overdueTasks: parseInt(summary.overdueTasks, 10),
        unassignedTasks: parseInt(summary.unassignedTasks, 10),
        totalMembers: parseInt(summary.totalMembers, 10),
      },
      taskStatusSummary: summary.taskStatusSummary || [],
    };
    
    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('Error in getProjectDashboardSummaryController:', error);
    res.status(500).json({ error: 'Internal server error while fetching dashboard summary.' });
  }
};