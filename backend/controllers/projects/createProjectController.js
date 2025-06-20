import { nanoid } from 'nanoid';
import pool from '../../db.js';

export const createProjectController = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const ownerId = req.user.id;
  
  const { projectName, projectKey } = req.body;

  if (!projectName?.trim()) {
    return res.status(400).json({ error: 'Project name is required.' });
  }
  if (!/^[A-Z]{3,4}$/.test(projectKey)) {
    return res.status(400).json({ error: 'Project key must be 3-4 uppercase letters.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const projectUrl = `${projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(8)}`;

    const insertProjectSQL = `
      INSERT INTO projects (project_url, project_key, project_name, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        project_url      AS "projectUrl",
        project_key      AS "projectKey",
        project_name     AS "projectName",
        owner_id         AS "ownerId",
        created_at       AS "createdAt";
    `;

    const { rows } = await client.query(insertProjectSQL, [
      projectUrl,
      projectKey.trim(),
      projectName.trim(),
      ownerId
    ]);
    const newProject = rows[0];

    // --- THIS IS THE FIX ---
    // The query now explicitly sets the role for the new owner.
    await client.query(
      `INSERT INTO project_users (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [newProject.id, ownerId]
    );
    // --- END OF FIX ---

    // Create default boards
    const defaultBoards = [
      { name: 'To Do',       position: 0 },
      { name: 'In Progress', position: 1 },
      { name: 'Done',        position: 2 },
    ];
    for (let board of defaultBoards) {
      await client.query(
        `INSERT INTO boards (project_id, name, position) VALUES ($1, $2, $3)`,
        [newProject.id, board.name, board.position]
      );
    }

    await client.query('COMMIT');
    
    return res.status(201).json(newProject);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating project:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Project URL or key already exists.' });
    }
    return res.status(500).json({ error: 'Server error during project creation.' });
  } finally {
    client.release();
  }
};