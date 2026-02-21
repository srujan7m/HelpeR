import { GoogleGenerativeAI } from "@google/generative-ai";

export class LLMService {
    private genAI: GoogleGenerativeAI;
    private workingModel: string | null = null;
    private readonly modelCandidates: string[];

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelCandidates = this.getModelCandidates(
            process.env.GEMINI_LLM_MODEL,
            ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"]
        );
    }

    async generateMOM(transcript: string): Promise<any> {
        try {
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

            const text = await this.generateWithFallback(prompt);
            return this.parseJson(text);

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

    private async generateWithFallback(prompt: string): Promise<string> {
        const candidates = this.workingModel
            ? [this.workingModel, ...this.modelCandidates.filter((m) => m !== this.workingModel)]
            : this.modelCandidates;

        for (const modelName of candidates) {
            try {
                const model = this.genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                this.workingModel = modelName;
                return text;
            } catch (error: any) {
                if (!this.isModelNotFoundError(error)) {
                    throw error;
                }
            }
        }

        throw new Error(`No supported Gemini model found. Attempted: ${candidates.join(", ")}`);
    }

    private parseJson(raw: string): any {
        try {
            return JSON.parse(raw);
        } catch {
            const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
            return JSON.parse(cleaned);
        }
    }

    private isModelNotFoundError(error: any): boolean {
        return error?.status === 404 || String(error?.message || "").includes("not found");
    }

    private getModelCandidates(value: string | undefined, defaults: string[]): string[] {
        const configured = (value || "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        return configured.length > 0 ? configured : defaults;
    }
}
