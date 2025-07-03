import pool from '../../db.js';

/**
 * PUT /api/users/onboarding
 * Updates the onboarding status for the authenticated user
 * Body: { completed: boolean }
 */
export const updateOnboardingController = async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed field must be a boolean value.' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE users 
       SET onboarding = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, onboarding, updated_at`,
      [completed, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log(`User ${userId} onboarding status updated to: ${completed}`);
    
    return res.status(200).json({
      message: 'Onboarding status updated successfully.',
      onboarding: rows[0].onboarding
    });

  } catch (err) {
    console.error('Error updating onboarding status:', err);
    return res.status(500).json({ error: 'Internal server error while updating onboarding status.' });
  }
}; 