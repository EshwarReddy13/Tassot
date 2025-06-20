import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const enhanceTaskDescriptionController = async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'A non-empty text field is required.' });
    }
    if (text.length > 2000) {
        return res.status(400).json({ error: 'Input text cannot exceed 2000 characters.' });
    }

    try {
        // As requested, using the specific lightweight preview model.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

        const prompt = `You are an expert project manager. Refine the following task description. Correct spelling and grammar, structure the text for clarity using markdown bullet points ("-") for lists if appropriate, and maintain a professional tone. Return only the refined description, with no extra headings, quotes, or explanation.
        User input: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhancedText = response.text().trim();

        res.status(200).json({ enhancedText });

    } catch (error) {
        console.error('Error in enhanceTaskDescriptionController:', error);
        res.status(500).json({ error: 'Failed to enhance task description due to an internal AI service error.' });
    }
};