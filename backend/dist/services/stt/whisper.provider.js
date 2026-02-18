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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhisperProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class WhisperProvider {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    transcribe(audioBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempFilePath = path_1.default.join(__dirname, `../../temp-${Date.now()}.webm`);
            try {
                fs_1.default.writeFileSync(tempFilePath, audioBuffer);
                const response = yield this.openai.audio.transcriptions.create({
                    file: fs_1.default.createReadStream(tempFilePath),
                    model: "whisper-1",
                    language: "en", // force english for now
                });
                return response.text;
            }
            catch (error) {
                console.error('Whisper Transcription Error:', error);
                throw error;
            }
            finally {
                if (fs_1.default.existsSync(tempFilePath)) {
                    fs_1.default.unlinkSync(tempFilePath);
                }
            }
        });
    }
}
exports.WhisperProvider = WhisperProvider;
