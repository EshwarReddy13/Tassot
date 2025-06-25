import pool from '../db.js';

/**
 * Logs an activity to the database. This function is designed to be called
 * after a successful database operation in other controllers/services.
 * It intentionally does not send a response to the client.
 * 
 * @param {object} logData - The data to log.
 * @param {string} logData.projectId - The UUID of the project where the activity occurred.
 * @param {string} logData.userId - The UUID of the user who performed the action.
 * @param {string} logData.primaryEntityType - The main entity being acted upon (e.g., 'task', 'comment').
 * @param {string} logData.primaryEntityId - The ID or key of the primary entity.
 * @param {string} logData.actionType - The type of action (e.g., 'create', 'update', 'delete').
 * @param {string} [logData.secondaryEntityType] - Optional: The context entity (e.g., a 'task' for a 'comment').
 * @param {string} [logData.secondaryEntityId] - Optional: The ID of the context entity.
 * @param {object} [logData.changeData] - Optional: A JSON object detailing what changed.
 */
export const logActivity = async ({
  projectId,
  userId,
  primaryEntityType,
  primaryEntityId,
  actionType,
  secondaryEntityType = null,
  secondaryEntityId = null,
  changeData = null
}) => {
  // Basic validation to prevent logging incomplete data
  if (!projectId || !userId || !primaryEntityType || !primaryEntityId || !actionType) {
    console.error('[ActivityService] Incomplete data provided for logging. Aborting.', { projectId, userId, primaryEntityType });
    return;
  }

  const logQuery = `
    INSERT INTO activities (
      project_id, 
      user_id, 
      primary_entity_type, 
      primary_entity_id, 
      action_type, 
      secondary_entity_type, 
      secondary_entity_id, 
      change_data
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
  `;

  try {
    await pool.query(logQuery, [
      projectId,
      userId,
      primaryEntityType,
      primaryEntityId,
      actionType,
      secondaryEntityType,
      secondaryEntityId,
      changeData ? JSON.stringify(changeData) : null,
    ]);
  } catch (error) {
    // Log the error but do not throw, as logging should not block the main application flow.
    console.error('CRITICAL: Failed to log user activity.', error);
  }
};