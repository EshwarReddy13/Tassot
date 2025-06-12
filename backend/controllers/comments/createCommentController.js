import pool from '../../db.js';

export const createCommentController = async (req, res) => {
  const { taskId } = req.params;
  const { content, parentId } = req.body;
  const { id: userId } = req.user;

  if (!content) {
    return res.status(400).json({ error: 'Comment content cannot be empty.' });
  }

  try {
    // Verify the user has access to the task's project before allowing a comment
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

    // Insert the new comment
    const insertQuery = `
      INSERT INTO comments (content, task_id, user_id, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, task_id, parent_id, user_id, created_at;
    `;
    const newCommentResult = await pool.query(insertQuery, [content, taskId, userId, parentId]);
    const newComment = newCommentResult.rows[0];
    
    // Fetch the full comment with user details to return to the frontend
    const finalCommentQuery = `
        SELECT c.*, u.first_name, u.last_name, u.photo_url
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
    `;
    const finalResult = await pool.query(finalCommentQuery, [newComment.id]);

    res.status(201).json(finalResult.rows[0]);

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};