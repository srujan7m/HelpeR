"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class LLMService {
    constructor() {
        this.workingModel = null;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.modelCandidates = this.getModelCandidates(process.env.GEMINI_LLM_MODEL, ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"]);
    }
    generateMOM(transcript) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const text = yield this.generateWithFallback(prompt);
                return this.parseJson(text);
            }
            catch (error) {
                console.error('LLM Generation Error:', error);
                // Return empty structure on error to prevent crash
                return {
                    summary: "Error generating summary.",
                    key_points: [],
                    action_items: [],
                    decisions: []
                };
            }
        });
    }
    generateWithFallback(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const candidates = this.workingModel
                ? [this.workingModel, ...this.modelCandidates.filter((m) => m !== this.workingModel)]
                : this.modelCandidates;
            for (const modelName of candidates) {
                try {
                    const model = this.genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: { responseMimeType: "application/json" }
                    });
                    const result = yield model.generateContent(prompt);
                    const response = yield result.response;
                    const text = response.text();
                    this.workingModel = modelName;
                    return text;
                }
                catch (error) {
                    if (!this.isModelNotFoundError(error)) {
                        throw error;
                    }
                }
            }
            throw new Error(`No supported Gemini model found. Attempted: ${candidates.join(", ")}`);
        });
    }
    parseJson(raw) {
        try {
            return JSON.parse(raw);
        }
        catch (_a) {
            const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
            return JSON.parse(cleaned);
        }
    }
    isModelNotFoundError(error) {
        return (error === null || error === void 0 ? void 0 : error.status) === 404 || String((error === null || error === void 0 ? void 0 : error.message) || "").includes("not found");
    }
    getModelCandidates(value, defaults) {
        const configured = (value || "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        return configured.length > 0 ? configured : defaults;
    }
}
exports.LLMService = LLMService;
