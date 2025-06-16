import pool from '../../db.js';

export const getProjectDetailsController = async (req, res) => {
    const { projectUrl } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User ID not found in token.' });
    }

    try {
        const query = `
            SELECT
                p.id AS project_id,
                p.project_url,
                p.project_key,
                p.project_name,
                p.owner_id,
                (
                    SELECT json_agg(b_agg)
                    FROM (
                        SELECT b.id, b.name, b.position
                        FROM boards b
                        WHERE b.project_id = p.id
                        ORDER BY b.position
                    ) AS b_agg
                ) AS boards,
                (
                    SELECT json_agg(t_agg)
                    FROM (
                        SELECT 
                            t.id, t.board_id, t.task_key, t.task_name, t.status, 
                            t.description, t.created_at, t.created_by, t.deadline,
                            (
                                SELECT json_agg(a_agg)
                                FROM (
                                    SELECT u.id, u.first_name, u.last_name, u.photo_url
                                    FROM users u
                                    JOIN task_assignees ta ON u.id = ta.user_id
                                    WHERE ta.task_id = t.id
                                ) AS a_agg
                            ) as assignees -- [NEW] This creates a nested array of assignee objects for each task
                        FROM tasks t
                        JOIN boards b ON t.board_id = b.id
                        WHERE b.project_id = p.id
                    ) AS t_agg
                ) AS tasks,
                (
                    SELECT json_agg(m_agg)
                    FROM (
                        SELECT u.id, u.first_name, u.last_name, u.photo_url, u.email
                        FROM users u
                        JOIN project_users pu_mem ON u.id = pu_mem.user_id
                        WHERE pu_mem.project_id = p.id
                    ) AS m_agg
                ) AS members
            FROM projects p
            JOIN project_users pu ON p.id = pu.project_id
            WHERE p.project_url = $1 AND pu.user_id = $2;
        `;

        const { rows } = await pool.query(query, [projectUrl, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Project not found or you do not have access.' });
        }

        const projectData = rows[0];
        const responsePayload = {
            project: {
                id: projectData.project_id,
                project_url: projectData.project_url,
                project_key: projectData.project_key,
                project_name: projectData.project_name,
                owner_id: projectData.owner_id,
            },
            boards: projectData.boards || [],
            tasks: projectData.tasks || [],
            members: projectData.members || [],
        };

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error('[Controller] CRITICAL ERROR in getProjectDetailsController:', error);
        res.status(500).json({ error: 'Internal server error while fetching project details.' });
    }
};