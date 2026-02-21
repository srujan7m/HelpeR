import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SpeechProvider {
    transcribe(audioBuffer: Buffer, mimeType?: string): Promise<string>;
}

export class GeminiProvider implements SpeechProvider {
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
            process.env.GEMINI_STT_MODEL,
            ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"]
        );
    }

    async transcribe(audioBuffer: Buffer, mimeType?: string): Promise<string> {
        // Gemini doesn't support streaming audio buffers directly in the same way as Whisper API file uploads sometimes do.
        // But we can send the audio data as a part of the prompt.
        // Ideally we would upload via File API for large files, but for chunks, inline data is fine.

        try {
            const resolvedMimeType = mimeType || process.env.MEETING_AUDIO_MIME_TYPE || "audio/webm";
            const audioData = audioBuffer.toString("base64");
            const candidates = this.workingModel
                ? [this.workingModel, ...this.modelCandidates.filter((m) => m !== this.workingModel)]
                : this.modelCandidates;

            for (const modelName of candidates) {
                try {
                    const model = this.genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent([
                        {
                            inlineData: {
                                mimeType: resolvedMimeType,
                                data: audioData
                            }
                        },
                        { text: "Transcribe this audio. Return only the text." }
                    ]);

                    const response = await result.response;
                    const text = response.text()?.trim() || "";
                    this.workingModel = modelName;
                    return text;
                } catch (modelError: any) {
                    if (!this.isModelNotFoundError(modelError)) {
                        throw modelError;
                    }
                }
            }

            console.error("Gemini Transcription Error: no supported model found", {
                attemptedModels: candidates
            });
            return "";

        } catch (error: any) {
            console.error('Gemini Transcription Error:', error);
            // If the audio is too short or empty, Gemini might error or return empty.
            return "";
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
