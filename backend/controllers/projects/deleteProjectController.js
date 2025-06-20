import pool from '../../db.js';

export const deleteProjectController = async (req, res) => {
  const { projectUrl } = req.params;
  
  // The requireProjectRole(['owner']) middleware has already run and confirmed
  // that the currently logged-in user is the owner of this project.
  // We can proceed directly to deletion.

  try {
    const deleteResult = await pool.query(
      `DELETE FROM projects WHERE project_url = $1 RETURNING id`,
      [projectUrl]
    );
    
    if (deleteResult.rowCount === 0) {
      // This would be unusual if the middleware passed, but is good for robustness.
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Returning a simple success message is good.
    // A 204 No Content is also standard for successful deletions.
    res.status(200).json({ message: 'Project successfully deleted.' });

  } catch (err) {
    console.error('deleteProjectController error:', err);
    res.status(500).json({ error: 'Internal server error during project deletion.' });
  }
};