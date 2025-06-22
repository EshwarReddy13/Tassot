import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../../db.js';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const enhanceTaskDescriptionController = async (req, res) => {
    const { text, projectUrl, taskName } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'A non-empty text field is required.' });
    }
    if (!projectUrl) {
        return res.status(400).json({ error: 'projectUrl is required to fetch AI settings.' });
    }
    if (!taskName) {
        return res.status(400).json({ error: 'taskName is required for context.' });
    }
    if (text.length > 2000) {
        return res.status(400).json({ error: 'Input text cannot exceed 2000 characters.' });
    }

    try {
        const projectResult = await pool.query(
            'SELECT settings, persona FROM projects WHERE project_url = $1',
            [projectUrl]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        
        const { settings, persona } = projectResult.rows[0];
        const prefs = settings.ai_preferences;
        const descPrefs = prefs.task_description;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        // FIXED: The check now uses `match_general_settings`
        const toneStyleLogic = descPrefs.match_general_settings
            ? `Tone: Inherit from the general settings. It should be ${prefs.general.tone}.
     Style: Inherit from the general settings. It should be ${prefs.general.style}.`
            : `Tone: Use the specific description tone: ${descPrefs.task_description_tone}.
     Style: Use the specific description style: ${descPrefs.task_description_style}.`;

        const prompt = `You are an expert ${persona}. Your task is to generate a comprehensive task description based on a task name and a user's initial notes, following a set of formatting rules.

The task name is: "${taskName}"
The user's initial notes are: "${text}" (If these notes are brief, expand on them. If they are detailed, refine and structure them.)

Follow these rules precisely:

**Content and Tone Rules:**
- **Tone & Style Logic:**
     ${toneStyleLogic}
- **Clarity:** The language should be understandable to a ${descPrefs.clarity_level} audience.
- **Formality:** The output must be ${prefs.general.formality}.
- **Person:** Write in the ${prefs.general.person}.
- **Language:** The output must be in ${prefs.general.language_style}.

**Structural Rules:**
- **Depth:** The description should be ${descPrefs.depth}.
- **Primary Structure:** The overall organization should follow a ${descPrefs.structure_type} pattern.
- **Content Elements:** You MUST include the following elements in your response: ${descPrefs.content_elements.join(', ')}. Adhere to this list strictly.

**Special Instructions:**
- **Notes:** ${prefs.special_notes || 'None.'}

Your response MUST be ONLY the generated task description in plain text or markdown, based on the requested content elements.
DO NOT include a title, preamble, or any explanatory text. Begin directly with the description content.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhancedText = response.text().trim();

        res.status(200).json({ enhancedText });

    } catch (error) {
        console.error('Error in enhanceTaskDescriptionController:', error);
        res.status(500).json({ error: 'Failed to enhance task description due to an internal AI service error.' });
    }
};