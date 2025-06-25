import pool from '../../../db.js';
import { z } from 'zod';
import { logActivity } from '../../../services/activityLogger.js'; // <-- IMPORT the service

// Zod schemas are unchanged and remain for validation
const aiPreferencesSchema = z.object({
  general: z.object({
    tone: z.string(),
    style: z.string(),
    formality: z.string(),
    person: z.string(),
    language_style: z.string(),
  }),
  task_name: z.object({
    length: z.string(),
    verb_style: z.string(),
    punctuation_style: z.string(),
  }),
  task_description: z.object({
    depth: z.string(),
    structure_type: z.string(),
    content_elements: z.array(z.string()),
    clarity_level: z.string(),
    match_general_settings: z.boolean(),
    task_description_tone: z.string(),
    task_description_style: z.string(),
    task_description_clarity_level_override: z.string(),
    task_description_verb_style_override: z.string(),
  }),
  special_notes: z.string(),
  selected_preset: z.string(),
});

const settingsSchema = z.object({
  ai_preferences: aiPreferencesSchema,
});

export const updateSettingsController = async (req, res) => {
  const { projectUrl } = req.params;
  const newSettings = req.body;
  const { id: userId } = req.user; // Get the user ID for logging

  // 1. Validate the incoming data
  const validationResult = settingsSchema.safeParse(newSettings);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Invalid settings structure.',
      details: validationResult.error.errors,
    });
  }

  try {
    // 2. We need the project's UUID for logging, so we fetch it.
    const projectResult = await pool.query(
      'SELECT id FROM projects WHERE project_url = $1',
      [projectUrl]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const projectId = projectResult.rows[0].id;
    
    // 3. Perform the update
    const updateResult = await pool.query(
      'UPDATE projects SET settings = $1, updated_at = now() WHERE id = $2 RETURNING settings',
      [newSettings, projectId] // Update using the reliable UUID
    );

    // 4. LOG THE ACTIVITY after the update is successful
    logActivity({
      projectId: projectId,
      userId: userId,
      primaryEntityType: 'project',
      primaryEntityId: projectId, // The project itself is the entity
      actionType: 'update',
      changeData: {
        updated_section: "AI Preferences" // A clean, high-level description of what changed
      }
    });

    // 5. Send the successful response
    res.status(200).json(updateResult.rows[0].settings);

  } catch (error) {
    console.error('Error updating project settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};