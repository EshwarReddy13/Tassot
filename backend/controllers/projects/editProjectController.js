import pool from '../../db.js';

export const editProjectController = async (req, res) => {
  const { projectUrl } = req.params;
  const { project_name, project_key } = req.body;

  // The requireProjectRole(['owner']) middleware has already authorized the user.

  if (!project_name?.trim()) {
      return res.status(400).json({ error: 'Project name cannot be empty.' });
  }
  if (!/^[A-Z]{3,4}$/.test(project_key)) {
    return res.status(400).json({ error: 'Project key must be 3-4 uppercase letters.' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE projects
          SET project_name = $1,
              project_key  = $2,
              updated_at   = now()
        WHERE project_url = $3
      RETURNING *;`,
      [project_name.trim(), project_key.trim(), projectUrl]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json({ message: 'Project updated successfully.', project: rows[0] });

  } catch (err) {
    // --- THIS IS THE FIX: ENHANCED ERROR LOGGING ---
    // This will now print the full, detailed database error to your backend console.
    console.error('💥 DETAILED DATABASE ERROR in editProjectController:', err);
    // --- END OF FIX ---
    
    if (err.code === '23505') { // Check for unique violation
      return res.status(409).json({ error: 'A project with this key already exists. Please choose another.' });
    }
    
    // Fallback for all other errors
    res.status(500).json({ error: 'An internal server error occurred while updating the project.' });
  }
};