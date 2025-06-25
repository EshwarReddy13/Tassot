import pool from '../../db.js';
import { logActivity } from '../../services/activityLogger.js';

export const pinProjectController = async (req, res) => {
  const { projectUrl } = req.params;
  const { id: userId } = req.user;

  console.log('=== PIN PROJECT DEBUG ===');
  console.log('Request params:', req.params);
  console.log('Request user:', req.user);
  console.log('Extracted userId:', userId);
  console.log('Project URL:', projectUrl);

  if (!userId) {
    console.log('ERROR: No userId found in req.user');
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (!projectUrl) {
    console.log('ERROR: No projectUrl found in params');
    return res.status(400).json({ error: 'Project URL is required.' });
  }

  try {
    // First, let's check if the user exists in the database
    const userCheck = await pool.query(
      'SELECT id, firebase_uid, email FROM users WHERE id = $1',
      [userId]
    );
    console.log('User check result:', userCheck.rows);

    // First, get the project ID and check if user has access
    const projectResult = await pool.query(
      `SELECT p.id, p.project_name, pu.role
       FROM projects p
       JOIN project_users pu ON p.id = pu.project_id
       WHERE p.project_url = $1 AND pu.user_id = $2`,
      [projectUrl, userId]
    );

    console.log('Project query result:', projectResult.rows);

    if (projectResult.rows.length === 0) {
      // Let's also check if the project exists at all
      const projectExists = await pool.query(
        'SELECT id, project_name FROM projects WHERE project_url = $1',
        [projectUrl]
      );
      
      console.log('Project exists check:', projectExists.rows);
      
      if (projectExists.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
      } else {
        // Let's also check what users are in this project
        const projectUsers = await pool.query(
          `SELECT pu.user_id, u.email, pu.role
           FROM project_users pu
           JOIN users u ON pu.user_id = u.id
           JOIN projects p ON pu.project_id = p.id
           WHERE p.project_url = $1`,
          [projectUrl]
        );
        console.log('Project users:', projectUsers.rows);
        
        return res.status(403).json({ error: 'You are not a member of this project.' });
      }
    }

    const projectId = projectResult.rows[0].id;
    const projectName = projectResult.rows[0].project_name;
    const userRole = projectResult.rows[0].role;

    console.log('User role:', userRole);
    console.log('Project ID:', projectId);

    // Check if the is_pinned column exists
    try {
      const columnCheck = await pool.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'project_users' AND column_name = 'is_pinned'`
      );
      
      console.log('Column check result:', columnCheck.rows);
      
      if (columnCheck.rows.length === 0) {
        return res.status(500).json({ 
          error: 'Database migration not completed. Please run the migration to add pinning functionality.' 
        });
      }
    } catch (columnError) {
      console.error('Column check error:', columnError);
      return res.status(500).json({ 
        error: 'Database migration not completed. Please run the migration to add pinning functionality.' 
      });
    }

    // Toggle the pin status
    const updateResult = await pool.query(
      `UPDATE project_users 
       SET is_pinned = NOT is_pinned, 
           sort_order = CASE 
             WHEN is_pinned = false THEN NULL 
             ELSE sort_order 
           END
       WHERE project_id = $1 AND user_id = $2
       RETURNING is_pinned`,
      [projectId, userId]
    );

    console.log('Update result:', updateResult.rows);

    const isPinned = updateResult.rows[0].is_pinned;

    // Log the activity
    logActivity({
      projectId: projectId,
      userId: userId,
      primaryEntityType: 'project',
      primaryEntityId: projectId,
      actionType: isPinned ? 'pin' : 'unpin',
      changeData: { project_name: projectName }
    });

    console.log('=== PIN PROJECT SUCCESS ===');
    res.json({ 
      success: true, 
      isPinned,
      message: isPinned ? 'Project pinned successfully!' : 'Project unpinned successfully!'
    });

  } catch (err) {
    console.error('pinProjectController error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 