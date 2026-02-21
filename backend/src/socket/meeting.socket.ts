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
            socket.data.meetingId = meetingId;
            socket.data.userId = userId;
            socket.join(meetingId);
            console.log(`User ${userId} joined room ${meetingId}`);

            try {
                const participant = await meetingService.joinMeeting(meetingId, userId);
                io.to(meetingId).emit('participant-joined', {
                    id: participant.user.id,
                    clerkId: participant.user.clerkId,
                    name: participant.user.name || participant.user.email || 'Participant'
                });

                const participants = await meetingService.getParticipants(meetingId);
                io.to(meetingId).emit('participants-updated', participants.map((p: any) => ({
                    id: p.user.id,
                    clerkId: p.user.clerkId,
                    name: p.user.name || p.user.email || 'Participant'
                })));
            } catch (e) {
                console.error('Error joining meeting:', e);
                socket.emit('meeting-error', {
                    message: 'Failed to join room'
                });
            }
        });

        socket.on('audio-chunk', async ({ meetingId, userId, audioChunk, audioMimeType }) => {
            if (!meetingId || !userId || !audioChunk) return;

            try {
                // Convert to Buffer regardless of input type (ArrayBuffer, etc.)
                const buffer = Buffer.from(audioChunk);

                // Transcribe
                // Note: We might want to accumulate chunks or silence detection for better quality
                const text = await speechProvider.transcribe(buffer, audioMimeType);

                if (text && text.trim().length > 0) {
                    console.log(`Transcript from ${userId}: ${text}`);

                    // Save to DB
                    const savedTranscript = await meetingService.saveTranscript(meetingId, userId, text);

                    // Broadcast
                    io.to(meetingId).emit('new-transcript', {
                        speakerId: savedTranscript.speaker.clerkId || savedTranscript.speaker.id,
                        speakerName: savedTranscript.speaker.name || savedTranscript.speaker.email || 'Participant',
                        text,
                        timestamp: new Date()
                    });
                }
            } catch (e) {
                console.error('Error processing audio:', e);
                socket.emit('meeting-error', {
                    message: 'Audio processing failed'
                });
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
                const fullText = transcripts
                    .map((t: any) => `${t.speaker.name || t.speaker.email || t.speakerId}: ${t.text}`)
                    .join('\n');

                if (!fullText) {
                    console.log("No transcripts to generate MOM.");
                    return;
                }

                const rawMom = await llm.generateMOM(fullText);
                const mom = {
                    summary: rawMom.summary || 'No summary available.',
                    key_points: rawMom.key_points || rawMom.keyPoints || [],
                    action_items: rawMom.action_items || rawMom.actionItems || [],
                    decisions: rawMom.decisions || []
                };

                await meetingService.saveMOM(meetingId, mom);

                io.to(meetingId).emit('mom-generated', {
                    summary: mom.summary,
                    keyPoints: mom.key_points,
                    actionItems: mom.action_items,
                    decisions: mom.decisions
                });

            } catch (e) {
                console.error('Error ending meeting:', e);
                socket.emit('meeting-error', {
                    message: 'Failed to complete meeting'
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}
