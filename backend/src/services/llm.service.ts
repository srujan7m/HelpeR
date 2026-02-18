import { GoogleGenerativeAI } from "@google/generative-ai";

export class LLMService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateMOM(transcript: string): Promise<any> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `
            You are an expert meeting assistant.
            Generate a structured JSON output based on the transcript provided.
            The JSON must have the following keys:
            - summary: A concise summary of the meeting.
            - key_points: Array of strings representing key discussion points.
            - action_items: Array of strings representing tasks to be done.
            - decisions: Array of strings representing decisions made.
            
            Transcript:
            ${transcript}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return JSON.parse(text);

        } catch (error) {
            console.error('LLM Generation Error:', error);
            // Return empty structure on error to prevent crash
            return {
                summary: "Error generating summary.",
                key_points: [],
                action_items: [],
                decisions: []
            };
        }
    }
}
