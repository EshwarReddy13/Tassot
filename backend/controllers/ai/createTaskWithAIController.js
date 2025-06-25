import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../../db.js';
import { logActivity } from '../../services/activityLogger.js';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const createTaskWithAIController = async (req, res) => {
    const { projectUrl } = req.params;
    const { userDescription, boardId, isFinalCreation } = req.body;
    const { id: userId } = req.user;

    console.log('AI Task Creation Request:', {
        projectUrl,
        boardId,
        isFinalCreation,
        userId,
        userDescriptionLength: userDescription?.length
    });

    if (!userDescription?.trim()) {
        return res.status(400).json({ error: 'Task description is required.' });
    }

    if (!boardId) {
        return res.status(400).json({ error: 'Board ID is required.' });
    }

    if (userDescription.length > 1000) {
        return res.status(400).json({ error: 'Task description cannot exceed 1000 characters.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get project details and settings
        const projectQuery = `
            SELECT p.id, p.project_name, p.project_key, p.description, p.settings, p.persona,
                   b.name as board_name
            FROM projects p
            JOIN project_users pu ON p.id = pu.project_id
            JOIN boards b ON p.id = b.project_id
            WHERE p.project_url = $1 AND pu.user_id = $2 AND b.id = $3
        `;
        
        const projectResult = await client.query(projectQuery, [projectUrl, userId, boardId]);
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project or board not found.' });
        }

        const project = projectResult.rows[0];
        const projectSettings = project.settings || {};
        const aiPreferences = projectSettings.ai_preferences || {};
        const projectDetails = projectSettings.project_details || {};

        // Get current date for AI context
        const currentDate = new Date();
        const currentDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

        console.log('Generating AI content for task...');

        // AI Generation using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Generate task name
        const taskNamePrompt = `You are an expert ${project.persona}. Generate a task name based on this description: "${userDescription}"

Follow these rules:
- Tone: ${aiPreferences.general?.tone || 'professional'}
- Style: ${aiPreferences.general?.style || 'goal-oriented'}
- Formality: ${aiPreferences.general?.formality || 'semi-formal'}
- Length: ${aiPreferences.task_name?.length || 'medium'}
- Verb Style: ${aiPreferences.task_name?.verb_style || 'imperative'}
- Punctuation: ${aiPreferences.task_name?.punctuation_style || 'title_case'}

Return ONLY the task name, no explanation, no ID, no additional text.`;

        const taskNameResult = await model.generateContent(taskNamePrompt);
        const generatedTaskName = taskNameResult.response.text().trim();

        // Generate task description
        const descriptionPrompt = `You are an expert ${project.persona}. Create a detailed task description for: "${generatedTaskName}"

Original user description: "${userDescription}"

Project context:
- Project Type: ${projectDetails.project_type || 'General'}
- Current Phase: ${projectDetails.current_phase || 'Development'}
- Team Size: ${projectDetails.team_size || 'Small'}
- Complexity: ${projectDetails.complexity_level || 'Medium'}

Follow these rules:
- Tone: ${aiPreferences.general?.tone || 'professional'}
- Style: ${aiPreferences.general?.style || 'goal-oriented'}
- Depth: ${aiPreferences.task_description?.depth || 'moderate'}
- Structure: ${aiPreferences.task_description?.structure_type || 'standard'}
- Clarity: ${aiPreferences.task_description?.clarity_level || 'mixed'}

Format the description with clear sections like Overview, Objectives, Requirements, and Acceptance Criteria.
Return ONLY the description, no additional text.`;

        const descriptionResult = await model.generateContent(descriptionPrompt);
        const generatedDescription = descriptionResult.response.text().trim();

        // Generate deadline with current date context
        const deadlinePrompt = `Based on this project context, suggest a realistic deadline for the task: "${generatedTaskName}"

Current date: ${currentDateStr}

Project details:
- Project Type: ${projectDetails.project_type || 'General'}
- Current Phase: ${projectDetails.current_phase || 'Development'}
- Team Size: ${projectDetails.team_size || 'Small'}
- Complexity: ${projectDetails.complexity_level || 'Medium'}

Consider the current date (${currentDateStr}) and suggest a future deadline that makes sense for this task.
Return ONLY a date in YYYY-MM-DD format, no explanation, no additional text.`;

        const deadlineResult = await model.generateContent(deadlinePrompt);
        const generatedDeadlineStr = deadlineResult.response.text().trim();
        
        // Parse the deadline
        let generatedDeadline = null;
        try {
            const deadlineDate = new Date(generatedDeadlineStr);
            if (!isNaN(deadlineDate.getTime()) && deadlineDate > currentDate) {
                generatedDeadline = deadlineDate.toISOString();
            } else {
                // Fallback to default deadline calculation
                const baseDays = {
                    'Simple': 3,
                    'Medium': 7,
                    'Complex': 14
                };
                const daysToAdd = baseDays[projectDetails.complexity_level] || 7;
                const fallbackDeadline = new Date();
                fallbackDeadline.setDate(fallbackDeadline.getDate() + daysToAdd);
                generatedDeadline = fallbackDeadline.toISOString();
            }
        } catch (error) {
            // Fallback to default deadline calculation
            const baseDays = {
                'Simple': 3,
                'Medium': 7,
                'Complex': 14
            };
            const daysToAdd = baseDays[projectDetails.complexity_level] || 7;
            const fallbackDeadline = new Date();
            fallbackDeadline.setDate(fallbackDeadline.getDate() + daysToAdd);
            generatedDeadline = fallbackDeadline.toISOString();
        }

        console.log('AI Generation complete:', {
            taskName: generatedTaskName,
            descriptionLength: generatedDescription.length,
            deadline: generatedDeadline,
            isFinalCreation
        });

        // If this is just generation (not final creation), return the generated content
        if (!isFinalCreation) {
            await client.query('ROLLBACK');
            console.log('Returning generated content (no task creation)');
            return res.status(200).json({
                generated: {
                    taskName: generatedTaskName,
                    description: generatedDescription,
                    deadline: generatedDeadline
                }
            });
        }

        console.log('Creating task in database...');

        // Generate task key
        const taskKeyResult = await client.query(
            'SELECT COUNT(*) as count FROM tasks t JOIN boards b ON t.board_id = b.id WHERE b.project_id = $1',
            [project.id]
        );
        const taskNumber = parseInt(taskKeyResult.rows[0].count) + 1;
        const taskKey = `${project.project_key}-${taskNumber}`;

        // Create the task
        const insertTaskQuery = `
            INSERT INTO tasks (board_id, task_key, task_name, description, status, created_by, deadline)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const taskResult = await client.query(insertTaskQuery, [
            boardId,
            taskKey,
            generatedTaskName,
            generatedDescription,
            project.board_name, // Use board name as status
            userId,
            generatedDeadline
        ]);

        const newTask = taskResult.rows[0];

        console.log('Task created successfully:', {
            taskId: newTask.id,
            taskKey: newTask.task_key,
            taskName: newTask.task_name
        });

        // Log the activity
        logActivity({
            projectId: project.id,
            userId: userId,
            primaryEntityType: 'task',
            primaryEntityId: newTask.task_key,
            actionType: 'create',
            changeData: {
                method: 'ai_generated',
                board_name: project.board_name
            }
        });

        await client.query('COMMIT');

        res.status(201).json({
            task: newTask,
            generated: {
                taskName: generatedTaskName,
                description: generatedDescription,
                deadline: generatedDeadline
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating AI task:', error);
        res.status(500).json({ error: 'Failed to create task with AI.' });
    } finally {
        client.release();
    }
}; 