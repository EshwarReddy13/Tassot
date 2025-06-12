import pool from '../../db.js';

export const getCommentsController = async (req, res) => {
  const { taskId } = req.params;
  const { id: userId } = req.user;

  try {
    // First, verify the user has access to the task's project
    const accessCheckQuery = `
      SELECT b.project_id FROM tasks t
      JOIN boards b ON t.board_id = b.id
      JOIN project_users pu ON b.project_id = pu.project_id
      WHERE t.id = $1 AND pu.user_id = $2
    `;
    const accessResult = await pool.query(accessCheckQuery, [taskId, userId]);
    if (accessResult.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have access to this task.' });
    }

    // Recursive CTE to fetch comments in a threaded, sorted manner
    const commentsQuery = `
      WITH RECURSIVE threaded_comments AS (
        -- Base case: select top-level comments
        SELECT
          c.id, c.content, c.task_id, c.parent_id, c.user_id, c.created_at,
          u.first_name, u.last_name, u.photo_url,
          1 AS depth,
          ARRAY[c.created_at] AS sort_path
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = $1 AND c.parent_id IS NULL

        UNION ALL

        -- Recursive step: find replies
        SELECT
          c.id, c.content, c.task_id, c.parent_id, c.user_id, c.created_at,
          u.first_name, u.last_name, u.photo_url,
          tc.depth + 1,
          tc.sort_path || c.created_at
        FROM comments c
        JOIN users u ON c.user_id = u.id
        JOIN threaded_comments tc ON c.parent_id = tc.id
      )
      SELECT id, content, task_id, parent_id, user_id, created_at, first_name, last_name, photo_url, depth
      FROM threaded_comments
      ORDER BY sort_path;
    `;
    
    const { rows } = await pool.query(commentsQuery, [taskId]);
    res.status(200).json(rows);

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};