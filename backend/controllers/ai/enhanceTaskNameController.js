import { GoogleGenerativeAI } from '@google/generative-ai';

// --- THIS IS THE FIX ---
// We check for the API key immediately. If it's missing, the server will log a fatal error.
// This prevents runtime crashes and makes debugging much easier.
if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY is not defined in the environment variables. Please check your .env file.");
}

// Initialize the Google AI client. This will only run if the key exists.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const enhanceTextController = async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'A non-empty text field is required.' });
    }
    if (text.length > 500) {
        return res.status(400).json({ error: 'Input text cannot exceed 500 characters.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

        const prompt = `You are an expert project manager. Your task is to refine a user's input for a task name.
        Make it clearer, more concise, and more actionable.
        Do not add any extra formatting, quotation marks, or explanations.
        Just return the single, refined task name.

        Here is the user's input: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhancedText = response.text().trim();

        res.status(200).json({ enhancedText });

    } catch (error) {
        console.error('Error with Gemini API:', error);
        // This provides more specific feedback if the API key is valid but there's another issue (e.g., billing).
        if (error.message.includes('API key not valid')) {
             return res.status(401).json({ error: 'The provided Gemini API key is not valid.' });
        }
        res.status(500).json({ error: 'Failed to enhance text due to an internal AI service error.' });
    }
};