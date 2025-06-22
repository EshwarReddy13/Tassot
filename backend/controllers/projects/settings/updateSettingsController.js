import pool from '../../../db.js';
import { z } from 'zod';

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
    match_general_settings: z.boolean(), // FIXED: Key name updated
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

  const validationResult = settingsSchema.safeParse(newSettings);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Invalid settings structure.',
      details: validationResult.error.errors,
    });
  }

  try {
    const updateResult = await pool.query(
      'UPDATE projects SET settings = $1, updated_at = now() WHERE project_url = $2 RETURNING settings',
      [newSettings, projectUrl]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json(updateResult.rows[0].settings);
  } catch (error) {
    console.error('Error updating project settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
