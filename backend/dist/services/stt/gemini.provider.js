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
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiProvider {
    constructor() {
        this.workingModel = null;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.modelCandidates = this.getModelCandidates(process.env.GEMINI_STT_MODEL, ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"]);
    }
    transcribe(audioBuffer, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            // Gemini doesn't support streaming audio buffers directly in the same way as Whisper API file uploads sometimes do.
            // But we can send the audio data as a part of the prompt.
            // Ideally we would upload via File API for large files, but for chunks, inline data is fine.
            var _a;
            try {
                const resolvedMimeType = mimeType || process.env.MEETING_AUDIO_MIME_TYPE || "audio/webm";
                const audioData = audioBuffer.toString("base64");
                const candidates = this.workingModel
                    ? [this.workingModel, ...this.modelCandidates.filter((m) => m !== this.workingModel)]
                    : this.modelCandidates;
                for (const modelName of candidates) {
                    try {
                        const model = this.genAI.getGenerativeModel({ model: modelName });
                        const result = yield model.generateContent([
                            {
                                inlineData: {
                                    mimeType: resolvedMimeType,
                                    data: audioData
                                }
                            },
                            { text: "Transcribe this audio. Return only the text." }
                        ]);
                        const response = yield result.response;
                        const text = ((_a = response.text()) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                        this.workingModel = modelName;
                        return text;
                    }
                    catch (modelError) {
                        if (!this.isModelNotFoundError(modelError)) {
                            throw modelError;
                        }
                    }
                }
                console.error("Gemini Transcription Error: no supported model found", {
                    attemptedModels: candidates
                });
                return "";
            }
            catch (error) {
                console.error('Gemini Transcription Error:', error);
                // If the audio is too short or empty, Gemini might error or return empty.
                return "";
            }
        });
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
exports.GeminiProvider = GeminiProvider;
