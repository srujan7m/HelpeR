import { Server, Socket } from 'socket.io';
import { GeminiProvider } from '../services/stt/gemini.provider';
import { LLMService } from '../services/llm.service';
import { MeetingService } from '../services/meeting.service';

let speechProvider: GeminiProvider;
let llm: LLMService;
let meetingService: MeetingService;

export function setupMeetingSocket(io: Server) {
    // Initialize services lazily to ensure env vars are loaded
    if (!speechProvider) {
        speechProvider = new GeminiProvider();
        llm = new LLMService();
        meetingService = new MeetingService();
    }

    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', async ({ meetingId, userId }) => {
            if (!meetingId || !userId) return;
            socket.join(meetingId);
            console.log(`User ${userId} joined room ${meetingId}`);

            try {
                await meetingService.joinMeeting(meetingId, userId);
                io.to(meetingId).emit('participant-joined', { userId });
            } catch (e) {
                console.error('Error joining meeting:', e);
            }
        });

        socket.on('audio-chunk', async ({ meetingId, userId, audioChunk }) => {
            if (!meetingId || !userId || !audioChunk) return;

            try {
                // Convert to Buffer regardless of input type (ArrayBuffer, etc.)
                const buffer = Buffer.from(audioChunk);

                // Transcribe
                // Note: We might want to accumulate chunks or silence detection for better quality
                const text = await speechProvider.transcribe(buffer);

                if (text && text.trim().length > 0) {
                    console.log(`Transcript from ${userId}: ${text}`);

                    // Save to DB
                    await meetingService.saveTranscript(meetingId, userId, text);

                    // Broadcast
                    io.to(meetingId).emit('new-transcript', {
                        speakerId: userId,
                        text,
                        timestamp: new Date()
                    });
                }
            } catch (e) {
                console.error('Error processing audio:', e);
            }
        });

        socket.on('end-meeting', async ({ meetingId }) => {
            if (!meetingId) return;
            console.log(`Ending meeting ${meetingId}`);

            try {
                await meetingService.endMeeting(meetingId);
                io.to(meetingId).emit('meeting-ended');

                // Generate MOM
                const transcripts = await meetingService.getTranscripts(meetingId);
                const fullText = transcripts.map((t: { speakerId: string; text: string }) => `${t.speakerId}: ${t.text}`).join('\n');

                if (!fullText) {
                    console.log("No transcripts to generate MOM.");
                    return;
                }

                const mom = await llm.generateMOM(fullText);
                await meetingService.saveMOM(meetingId, mom);

                io.to(meetingId).emit('mom-generated', mom);

            } catch (e) {
                console.error('Error ending meeting:', e);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}
