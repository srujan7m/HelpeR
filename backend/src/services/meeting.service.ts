import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MeetingService {
    async createMeeting(userId: string, title: string) {
        return prisma.meeting.create({
            data: {
                title,
                createdById: userId,
                status: 'SCHEDULED'
            }
        });
    }

    async joinMeeting(meetingId: string, userId: string) {
        // Check if participant already exists
        const existing = await prisma.participant.findFirst({
            where: { meetingId, userId }
        });

        if (existing) return existing;

        return prisma.participant.create({
            data: {
                meetingId,
                userId
            }
        });
    }

    async saveTranscript(meetingId: string, userId: string, text: string) {
        return prisma.transcript.create({
            data: {
                meetingId,
                speakerId: userId,
                text
            }
        });
    }

    async endMeeting(meetingId: string) {
        return prisma.meeting.update({
            where: { id: meetingId },
            data: {
                status: 'COMPLETED',
                endedAt: new Date()
            }
        });
    }

    async getTranscripts(meetingId: string) {
        return prisma.transcript.findMany({
            where: { meetingId },
            orderBy: { createdAt: 'asc' }
        });
    }

    async saveMOM(meetingId: string, momData: any) {
        return prisma.minuteOfMeeting.create({
            data: {
                meetingId,
                summary: momData.summary,
                keyPoints: momData.key_points || [],
                actionItems: momData.action_items || [],
                decisions: momData.decisions || []
            }
        });
    }
}
