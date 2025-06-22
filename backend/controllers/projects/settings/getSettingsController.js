import pool from '../../../db.js'; // Adjust path to db connection if needed

export const getSettingsController = async (req, res) => {
  // Debugging statement to log the received parameters
  console.log('[DEBUG] getSettingsController received params:', req.params);

  const { projectUrl } = req.params;

  if (!projectUrl) {
    return res.status(400).json({ error: 'Project URL is required' });
  }

  try {
    const result = await pool.query(
      'SELECT settings FROM projects WHERE project_url = $1', // FIXED: Query by project_url instead of id
      [projectUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const settings = result.rows[0].settings || {}; // Fallback to empty object

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching project settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
