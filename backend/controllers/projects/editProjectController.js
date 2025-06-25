import pool from '../../db.js';
import { logActivity } from '../../services/activityLogger.js'; // <-- IMPORT the service

export const editProjectController = async (req, res) => {
  const { projectUrl } = req.params;
  const { project_name, project_key } = req.body;
  const { id: userId } = req.user; // Get the user ID for logging

  if (!project_name?.trim()) {
      return res.status(400).json({ error: 'Project name cannot be empty.' });
  }
  if (!/^[A-Z]{3,4}$/.test(project_key)) {
    return res.status(400).json({ error: 'Project key must be 3-4 uppercase letters.' });
  }

  try {
    // Get the "before" state of the project for comparison
    const oldProjectResult = await pool.query('SELECT id, project_name, project_key FROM projects WHERE project_url = $1', [projectUrl]);
    if (oldProjectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
    }
    const oldProject = oldProjectResult.rows[0];

    const { rows } = await pool.query(
      `UPDATE projects
          SET project_name = $1,
              project_key  = $2,
              updated_at   = now()
        WHERE project_url = $3
      RETURNING *;`,
      [project_name.trim(), project_key.trim(), projectUrl]
    );

    const updatedProject = rows[0];

    // --- LOG THE ACTIVITY ---
    // Log if the project name changed
    if (oldProject.project_name !== updatedProject.project_name) {
      logActivity({
        projectId: updatedProject.id,
        userId: userId,
        primaryEntityType: 'project',
        primaryEntityId: updatedProject.id,
        actionType: 'update',
        changeData: { field: 'name', from: oldProject.project_name, to: updatedProject.project_name }
      });
    }

    // Log if the project key changed
    if (oldProject.project_key !== updatedProject.project_key) {
      logActivity({
        projectId: updatedProject.id,
        userId: userId,
        primaryEntityType: 'project',
        primaryEntityId: updatedProject.id,
        actionType: 'update',
        changeData: { field: 'key', from: oldProject.project_key, to: updatedProject.project_key }
      });
    }
    // ------------------------

    res.status(200).json({ message: 'Project updated successfully.', project: updatedProject });

  } catch (err) {
    console.error('DETAILED DATABASE ERROR in editProjectController:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A project with this key already exists. Please choose another.' });
    }
    res.status(500).json({ error: 'An internal server error occurred while updating the project.' });
  }
};