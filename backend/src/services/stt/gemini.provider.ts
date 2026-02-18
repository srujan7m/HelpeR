import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

export interface SpeechProvider {
    transcribe(audioBuffer: Buffer): Promise<string>;
}

export class GeminiProvider implements SpeechProvider {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async transcribe(audioBuffer: Buffer): Promise<string> {
        // Gemini doesn't support streaming audio buffers directly in the same way as Whisper API file uploads sometimes do.
        // But we can send the audio data as a part of the prompt.
        // Ideally we would upload via File API for large files, but for chunks, inline data is fine.

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: "audio/webm", // Assuming we are sending webm from frontend
                        data: audioBuffer.toString("base64")
                    }
                },
                { text: "Transcribe this audio. Return only the text." }
            ]);

            const response = await result.response;
            return response.text();

        } catch (error: any) {
            console.error('Gemini Transcription Error:', error);
            // If the audio is too short or empty, Gemini might error or return empty.
            return "";
        }
    }
}
