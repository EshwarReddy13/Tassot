import pool from '../../db.js';
import { logActivity } from '../../services/activityLogger.js';

export const updateProjectOrderController = async (req, res) => {
  const { projectOrders } = req.body; // Array of { projectUrl, sortOrder }
  const { id: userId } = req.user;

  console.log('Update project order request:', { userId, projectOrdersCount: projectOrders?.length });

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (!Array.isArray(projectOrders) || projectOrders.length === 0) {
    return res.status(400).json({ error: 'Project orders array is required.' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Validate that all projects exist and user has access
    const projectUrls = projectOrders.map(p => p.projectUrl);
    const validationResult = await client.query(
      `SELECT p.project_url, p.id, p.project_name, pu.role
       FROM projects p
       JOIN project_users pu ON p.id = pu.project_id
       WHERE p.project_url = ANY($1) AND pu.user_id = $2`,
      [projectUrls, userId]
    );

    console.log('Validation result:', validationResult.rows);

    if (validationResult.rows.length !== projectOrders.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'One or more projects not found or you do not have access.',
        requested: projectOrders.length,
        found: validationResult.rows.length
      });
    }

    // Create a map for quick lookup
    const projectMap = new Map();
    validationResult.rows.forEach(row => {
      projectMap.set(row.project_url, { id: row.id, name: row.project_name, role: row.role });
    });

    // Check if the sort_order column exists
    try {
      const columnCheck = await client.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'project_users' AND column_name = 'sort_order'`
      );
      
      if (columnCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({ 
          error: 'Database migration not completed. Please run the migration to add reordering functionality.' 
        });
      }
    } catch (columnError) {
      await client.query('ROLLBACK');
      console.error('Column check error:', columnError);
      return res.status(500).json({ 
        error: 'Database migration not completed. Please run the migration to add reordering functionality.' 
      });
    }

    // Update sort orders
    for (const { projectUrl, sortOrder } of projectOrders) {
      const project = projectMap.get(projectUrl);
      if (project) {
        await client.query(
          `UPDATE project_users 
           SET sort_order = $1 
           WHERE project_id = $2 AND user_id = $3`,
          [sortOrder, project.id, userId]
        );
      }
    }

    await client.query('COMMIT');

    // Log the activity
    logActivity({
      projectId: null, // This affects multiple projects
      userId: userId,
      primaryEntityType: 'project',
      primaryEntityId: 'multiple',
      actionType: 'reorder',
      changeData: { 
        reordered_projects: projectOrders.length,
        project_names: Array.from(projectMap.values()).map(p => p.name)
      }
    });

    res.json({ 
      success: true, 
      message: `Project order updated successfully!`
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('updateProjectOrderController error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}; 