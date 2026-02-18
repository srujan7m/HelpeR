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
exports.setupMeetingSocket = setupMeetingSocket;
const gemini_provider_1 = require("../services/stt/gemini.provider");
const llm_service_1 = require("../services/llm.service");
const meeting_service_1 = require("../services/meeting.service");
let speechProvider;
let llm;
let meetingService;
function setupMeetingSocket(io) {
    // Initialize services lazily to ensure env vars are loaded
    if (!speechProvider) {
        speechProvider = new gemini_provider_1.GeminiProvider();
        llm = new llm_service_1.LLMService();
        meetingService = new meeting_service_1.MeetingService();
    }
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('join-room', (_a) => __awaiter(this, [_a], void 0, function* ({ meetingId, userId }) {
            if (!meetingId || !userId)
                return;
            socket.join(meetingId);
            console.log(`User ${userId} joined room ${meetingId}`);
            try {
                yield meetingService.joinMeeting(meetingId, userId);
                io.to(meetingId).emit('participant-joined', { userId });
            }
            catch (e) {
                console.error('Error joining meeting:', e);
            }
        }));
        socket.on('audio-chunk', (_a) => __awaiter(this, [_a], void 0, function* ({ meetingId, userId, audioChunk }) {
            if (!meetingId || !userId || !audioChunk)
                return;
            try {
                // Convert to Buffer regardless of input type (ArrayBuffer, etc.)
                const buffer = Buffer.from(audioChunk);
                // Transcribe
                // Note: We might want to accumulate chunks or silence detection for better quality
                const text = yield speechProvider.transcribe(buffer);
                if (text && text.trim().length > 0) {
                    console.log(`Transcript from ${userId}: ${text}`);
                    // Save to DB
                    yield meetingService.saveTranscript(meetingId, userId, text);
                    // Broadcast
                    io.to(meetingId).emit('new-transcript', {
                        speakerId: userId,
                        text,
                        timestamp: new Date()
                    });
                }
            }
            catch (e) {
                console.error('Error processing audio:', e);
            }
        }));
        socket.on('end-meeting', (_a) => __awaiter(this, [_a], void 0, function* ({ meetingId }) {
            if (!meetingId)
                return;
            console.log(`Ending meeting ${meetingId}`);
            try {
                yield meetingService.endMeeting(meetingId);
                io.to(meetingId).emit('meeting-ended');
                // Generate MOM
                const transcripts = yield meetingService.getTranscripts(meetingId);
                const fullText = transcripts.map((t) => `${t.speakerId}: ${t.text}`).join('\n');
                if (!fullText) {
                    console.log("No transcripts to generate MOM.");
                    return;
                }
                const mom = yield llm.generateMOM(fullText);
                yield meetingService.saveMOM(meetingId, mom);
                io.to(meetingId).emit('mom-generated', mom);
            }
            catch (e) {
                console.error('Error ending meeting:', e);
            }
        }));
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}
