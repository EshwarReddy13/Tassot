import pool from '../../db.js';

export const getDashboardStatsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get current week stats
    const currentWeekStats = await getWeekStats(userId, oneWeekAgo, now, now);
    
    // Get previous week stats
    const previousWeekStats = await getWeekStats(userId, twoWeeksAgo, oneWeekAgo, now);

    // Calculate percentage changes
    const stats = {
      totalProjects: {
        current: currentWeekStats.totalProjects,
        previous: previousWeekStats.totalProjects,
        change: calculatePercentageChange(previousWeekStats.totalProjects, currentWeekStats.totalProjects)
      },
      overdueTasks: {
        current: currentWeekStats.overdueTasks,
        previous: previousWeekStats.overdueTasks,
        change: calculatePercentageChange(previousWeekStats.overdueTasks, currentWeekStats.overdueTasks)
      },
      tasksDueSoon: {
        current: currentWeekStats.tasksDueSoon,
        previous: previousWeekStats.tasksDueSoon,
        change: calculatePercentageChange(previousWeekStats.tasksDueSoon, currentWeekStats.tasksDueSoon)
      },
      completedTasks: {
        current: currentWeekStats.completedThisWeek,
        previous: previousWeekStats.completedThisWeek,
        change: calculatePercentageChange(previousWeekStats.completedThisWeek, currentWeekStats.completedThisWeek)
      }
    };

    res.json(stats);
  } catch (err) {
    console.error('Error in getDashboardStatsController:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

const getWeekStats = async (userId, startDate, endDate, currentDate) => {
  // Get total projects (all time for current user)
  const { rows: projectRows } = await pool.query(
    'SELECT COUNT(*) as count FROM project_users WHERE user_id = $1',
    [userId]
  );
  const totalProjects = parseInt(projectRows[0].count);

  // Get overdue tasks
  const { rows: overdueTaskRows } = await pool.query(
    `SELECT COUNT(*) as count 
     FROM task_assignees ta 
     JOIN tasks t ON ta.task_id = t.id 
     WHERE ta.user_id = $1 
     AND t.deadline < $2 
     AND t.status != 'Done'`,
    [userId, currentDate]
  );
  const overdueTasks = parseInt(overdueTaskRows[0].count);

  // Get tasks due soon (within 7 days)
  const { rows: tasksDueRows } = await pool.query(
    `SELECT COUNT(*) as count 
     FROM task_assignees ta 
     JOIN tasks t ON ta.task_id = t.id 
     WHERE ta.user_id = $1 
     AND t.deadline BETWEEN $2 AND $3 
     AND t.status != 'Done'`,
    [userId, currentDate, new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)]
  );
  const tasksDueSoon = parseInt(tasksDueRows[0].count);

  // Get completed tasks (all time since we can't track when they were completed)
  const { rows: completedRows } = await pool.query(
    `SELECT COUNT(*) as count 
     FROM task_assignees ta 
     JOIN tasks t ON ta.task_id = t.id 
     WHERE ta.user_id = $1 
     AND t.status = 'Done'`,
    [userId]
  );
  const completedThisWeek = parseInt(completedRows[0].count);

  return {
    totalProjects,
    overdueTasks,
    tasksDueSoon,
    completedThisWeek
  };
};

const calculatePercentageChange = (previous, current) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}; 