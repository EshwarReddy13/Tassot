import { nanoid } from 'nanoid';
import pool from '../../db.js';
import { createAndSendInvitation } from '../../services/invitationService.js';
import { logActivity } from '../../services/activityLogger.js'; // <-- IMPORT the service

const balancedPresetSettings = {
  "ai_preferences": {
    "general": {
      "tone": "professional",
      "style": "goal-oriented",
      "formality": "semi-formal",
      "person": "third-person",
      "language_style": "en-US"
    },
    "task_name": {
      "length": "medium",
      "verb_style": "imperative",
      "punctuation_style": "title_case"
    },
    "task_description": {
      "depth": "moderate",
      "structure_type": "standard",
      "content_elements": ["main_heading", "sub_heading", "sentences", "bullet_points", "numbered_points"],
      "clarity_level": "mixed",
      "match_general_settings": true,
      "task_description_tone": "neutral",
      "task_description_style": "descriptive",
      "task_description_clarity_level_override": "mixed",
      "task_description_verb_style_override": "descriptive"
    },
    "special_notes": "",
    "selected_preset": "balanced"
  }
};

export const createProjectController = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const ownerId = req.user.id;
  
  const { projectName, projectKey, persona, inviteEmails } = req.body;

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
      INSERT INTO projects (project_url, project_key, project_name, owner_id, persona, settings)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const { rows } = await client.query(insertProjectSQL, [
      projectUrl,
      projectKey.trim(),
      projectName.trim(),
      ownerId,
      persona || 'project manager',
      balancedPresetSettings
    ]);
    const newProject = rows[0];

    await client.query(
      `INSERT INTO project_users (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [newProject.id, ownerId]
    );

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
    
    // --- LOG THE ACTIVITY ---
    logActivity({
      projectId: newProject.id,
      userId: ownerId,
      primaryEntityType: 'project',
      primaryEntityId: newProject.id,
      actionType: 'create'
    });
    // ------------------------

    res.status(201).json({
        id: newProject.id,
        projectUrl: newProject.project_url,
        projectKey: newProject.project_key,
        projectName: newProject.project_name,
        ownerId: newProject.owner_id,
        createdAt: newProject.created_at,
    });

    if (inviteEmails && inviteEmails.length > 0) {
      console.log(`[INFO] Project created. Attempting to send ${inviteEmails.length} invitations.`);
      for (const email of inviteEmails) {
        try {
          if (!email) {
            console.warn('[WARN] Skipped an empty email entry in inviteEmails array.');
            continue;
          }
          await createAndSendInvitation({
            projectId: newProject.id,
            projectName: newProject.project_name,
            inviterId: ownerId,
            inviteeEmail: email
          });
        } catch (err) {
          console.error(`[Non-blocking] Failed to send initial invitation to ${email}:`, err.message);
        }
      }
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating project:', err);
    if (!res.headersSent) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Project URL or key already exists.' });
      }
      return res.status(500).json({ error: 'Server error during project creation.' });
    }
  } finally {
    client.release();
  }
};