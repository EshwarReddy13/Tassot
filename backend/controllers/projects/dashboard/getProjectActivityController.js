import pool from '../../../db.js';

export const getProjectActivityController = async (req, res) => {
  const { projectUrl } = req.params;
  const { id: userId } = req.user;

  try {
    const activityQuery = `
      SELECT * FROM (
          -- New Tasks created by any user in the project
          SELECT 
              'new_task' as type, 
              t.created_at as timestamp, 
              jsonb_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'photo_url', u.photo_url) as user_info, 
              jsonb_build_object('task_key', t.task_key, 'task_name', t.task_name) as item_info
          FROM tasks t
          JOIN users u ON t.created_by = u.id
          JOIN boards b ON t.board_id = b.id
          WHERE b.project_id = (SELECT id FROM projects WHERE project_url = $1)
          
          UNION ALL

          -- New Comments on tasks in the project
          SELECT 
              'new_comment' as type, 
              c.created_at as timestamp, 
              jsonb_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'photo_url', u.photo_url) as user_info, 
              jsonb_build_object('task_key', t.task_key, 'content_preview', left(c.content, 40)) as item_info
          FROM comments c
          JOIN users u ON c.user_id = u.id
          JOIN tasks t ON c.task_id = t.id
          JOIN boards b ON t.board_id = b.id
          WHERE b.project_id = (SELECT id FROM projects WHERE project_url = $1)

          UNION ALL

          -- New Members joining the project (excluding the current user seeing their own join)
          SELECT 
              'new_member' as type, 
              pu.added_at as timestamp, 
              jsonb_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'photo_url', u.photo_url) as user_info, 
              null as item_info
          FROM project_users pu
          JOIN users u ON pu.user_id = u.id
          WHERE pu.project_id = (SELECT id FROM projects WHERE project_url = $1) AND pu.user_id <> $2
      ) as activities
      ORDER BY timestamp DESC
      LIMIT 15;
    `;
    
    const { rows } = await pool.query(activityQuery, [projectUrl, userId]);
    
    res.status(200).json(rows);

  } catch (error) {
    console.error('Error in getProjectActivityController:', error);
    res.status(500).json({ error: 'Internal server error while fetching activity feed.' });
  }
};