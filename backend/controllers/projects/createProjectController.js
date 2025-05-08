// src/controllers/project/createProjectController.js
import pool from '../../db.js'; // Adjust path to your PostgreSQL pool instance

/**
 * @description Create a new project, add the creator as a member, and create default boards.
 * @route POST /api/projects
 * @access Private (Requires Authentication)
 */
export const createProjectController = async (req, res) => {
  // Assumes authentication middleware has run and attached user info (esp. PostgreSQL user ID)
  // to req.user. If not, you need to implement auth middleware first.
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const ownerId = req.user.id; // The PostgreSQL UUID of the logged-in user

  const { projectName, projectKey } = req.body;

  // Basic validation
  if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
    return res.status(400).json({ error: 'Project name is required.' });
  }
  if (!projectKey || typeof projectKey !== 'string' || projectKey.trim().length === 0) {
    return res.status(400).json({ error: 'Project key is required.' });
  }

  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    // 1. Insert into projects table
    const projectInsertQuery = `
      INSERT INTO projects (project_key, project_name, owner_id)
      VALUES ($1, $2, $3)
      RETURNING id, project_key, project_name, owner_id, created_at;
    `;
    const projectResult = await client.query(projectInsertQuery, [
      projectKey.trim(),
      projectName.trim(),
      ownerId,
    ]);

    if (projectResult.rows.length === 0) {
      throw new Error('Project creation failed, no rows returned.');
    }
    const newProject = projectResult.rows[0];
    const newProjectId = newProject.id; // Get the auto-generated UUID of the project

    // 2. Insert into project_users table (add owner as member)
    const projectUserInsertQuery = `
      INSERT INTO project_users (project_id, user_id)
      VALUES ($1, $2);
    `;
    await client.query(projectUserInsertQuery, [newProjectId, ownerId]);

    // 3. Insert default boards into the boards table
    const defaultBoards = [
      { name: 'To-Do', position: 0 },
      { name: 'In Progress', position: 1 },
      { name: 'Done', position: 2 },
    ];

    const boardInsertQuery = `
      INSERT INTO boards (project_id, name, position)
      VALUES ($1, $2, $3);
    `;

    // Loop and insert each default board
    // Using Promise.all to run inserts concurrently (within the transaction)
    await Promise.all(
        defaultBoards.map(board =>
            client.query(boardInsertQuery, [newProjectId, board.name, board.position])
        )
    );

    // Alternative: Prepare a multi-row insert statement if preferred
    // const boardValues = defaultBoards.map((board, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(',');
    // const boardParams = defaultBoards.flatMap(board => [newProjectId, board.name, board.position]);
    // const multiBoardInsertQuery = `INSERT INTO boards (project_id, name, position) VALUES ${boardValues};`;
    // await client.query(multiBoardInsertQuery, boardParams);


    // Commit transaction
    await client.query('COMMIT');

    // Return the created project data (boards are implicitly created)
    res.status(201).json({
      id: newProject.id,
      projectKey: newProject.project_key,
      projectName: newProject.project_name,
      ownerId: newProject.owner_id,
      createdAt: newProject.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error creating project and default boards:', err);

    // Check for unique constraint violation (projectKey likely)
    if (err.code === '23505' && err.constraint === 'projects_project_key_key') {
      return res.status(409).json({ error: `Project key '${projectKey}' already exists.` });
    }

    res.status(500).json({ error: 'Failed to create project due to server error.' });
  } finally {
    client.release(); // Release the client back to the pool
  }
};