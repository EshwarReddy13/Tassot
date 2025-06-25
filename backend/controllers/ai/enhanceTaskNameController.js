import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../../db.js'; // <-- ADDED: Import the database pool

if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The function is renamed for clarity to reflect it handles task names
export const enhanceTaskNameController = async (req, res) => {
    // UPDATED: Expect projectUrl in the body
    const { text, projectUrl } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'A non-empty text field is required.' });
    }
    // ADDED: Validate projectUrl
    if (!projectUrl) {
        return res.status(400).json({ error: 'projectUrl is required to fetch AI settings.' });
    }
    if (text.length > 500) {
        return res.status(400).json({ error: 'Input text cannot exceed 500 characters.' });
    }

    try {
        // --- NEW: Fetch project-specific AI settings and persona ---
        const projectResult = await pool.query(
            'SELECT settings, persona, description FROM projects WHERE project_url = $1',
            [projectUrl]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        
        const { settings, persona, description } = projectResult.rows[0];
        const prefs = settings.ai_preferences;
        const projectDetails = settings.project_details || {};
        // --- End of new database logic ---

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

        // --- UPDATED: Dynamic prompt construction with project context ---
        const prompt = `You are an expert ${persona}. Your task is to refine a user-provided task name to make it clearer and more effective.

Project Context:
- Project Description: ${description || 'No description provided'}
- Project Type: ${projectDetails.project_type || 'General'}
- Current Phase: ${projectDetails.current_phase || 'Development'}
- Team Size: ${projectDetails.team_size || 'Small'}
- Complexity Level: ${projectDetails.complexity_level || 'Medium'}

The original task name is: "${text}"

Follow these rules precisely:
- Tone: The output should have a ${prefs.general.tone} tone.
- Style: The output should be ${prefs.general.style}.
- Formality: The output must be ${prefs.general.formality}.
- Person: Write in the ${prefs.general.person}.
- Language: The output must be in ${prefs.general.language_style}.
- Length: The name should be ${prefs.task_name.length} in length.
- Verb Style: Start the name with an ${prefs.task_name.verb_style} verb.
- Punctuation: Use ${prefs.task_name.punctuation_style}.
- Additional Instructions: ${prefs.special_notes || 'None.'}

Consider the project context when generating the task name to ensure it aligns with the project's goals and current phase.

Your response MUST be ONLY the refined task name.
DO NOT include any explanation, preamble, or quotation marks.`;
        // --- End of dynamic prompt ---

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhancedText = response.text().trim();

        res.status(200).json({ enhancedText });

    } catch (error) {
        console.error('Error in enhanceTaskNameController:', error);
        res.status(500).json({ error: 'Failed to enhance text due to an internal server error.' });
    }
};