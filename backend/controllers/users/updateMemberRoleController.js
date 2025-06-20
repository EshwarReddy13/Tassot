import pool from '../../db.js';

export const updateMemberRoleController = async (req, res) => {
    const { projectUrl, memberId } = req.params;
    const { role: newRole } = req.body;
    const actorId = req.user.id; // The user PERFORMING the action

    if (!newRole || !['owner', 'editor', 'user'].includes(newRole)) {
        return res.status(400).json({ error: 'Invalid role provided. Must be one of: owner, editor, user.' });
    }

    if (actorId === memberId) {
        return res.status(400).json({ error: "You cannot change your own role. Ownership must be transferred by assigning the owner role to another member." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const permissionsQuery = `
            SELECT 
                p.id as project_id,
                p.owner_id,
                actor.role as actor_role,
                target.role as target_role
            FROM projects p
            LEFT JOIN project_users actor ON p.id = actor.project_id AND actor.user_id = $2
            LEFT JOIN project_users target ON p.id = target.project_id AND target.user_id = $3
            WHERE p.project_url = $1;
        `;
        const permResult = await client.query(permissionsQuery, [projectUrl, actorId, memberId]);
        if (permResult.rows.length === 0) {
            throw new Error('Project not found or actor/target not in project.');
        }

        const { project_id, owner_id, actor_role, target_role } = permResult.rows[0];

        // Authorization logic
        if (actor_role !== 'owner' && actor_role !== 'editor') {
            await client.query('ROLLBACK');
            client.release();
            return res.status(403).json({ error: 'Forbidden: You must be an owner or editor to change member roles.' });
        }
        if (actor_role === 'editor' && (newRole === 'owner' || target_role === 'owner')) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(403).json({ error: 'Forbidden: Editors cannot create or modify an owner.' });
        }

        // Ownership Transfer Logic
        if (newRole === 'owner' && actor_role === 'owner') {
            await client.query('UPDATE projects SET owner_id = $1 WHERE id = $2', [memberId, project_id]);
            await client.query('UPDATE project_users SET role = $1 WHERE project_id = $2 AND user_id = $3', ['editor', project_id, actorId]);
            await client.query('UPDATE project_users SET role = $1 WHERE project_id = $2 AND user_id = $3', ['owner', project_id, memberId]);
        } else {
            // Standard Role Change
            await client.query(
                'UPDATE project_users SET role = $1 WHERE project_id = $2 AND user_id = $3',
                [newRole, project_id, memberId]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Role updated successfully.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating member role:', error);
        res.status(500).json({ error: 'Internal server error.' });
    } finally {
        client.release();
    }
};