import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MeetingService {
    private async resolveDbUserId(userIdOrClerkId: string): Promise<string | null> {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ id: userIdOrClerkId }, { clerkId: userIdOrClerkId }]
            },
            select: { id: true }
        });

        return user?.id ?? null;
    }

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
        const dbUserId = await this.resolveDbUserId(userId);
        if (!dbUserId) {
            throw new Error('User not found in database');
        }

        // Check if participant already exists
        const existing = await prisma.participant.findFirst({
            where: { meetingId, userId: dbUserId },
            include: {
                user: {
                    select: {
                        id: true,
                        clerkId: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (existing) return existing;

        return prisma.participant.create({
            data: {
                meetingId,
                userId: dbUserId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        clerkId: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async saveTranscript(meetingId: string, userId: string, text: string) {
        const dbUserId = await this.resolveDbUserId(userId);
        if (!dbUserId) {
            throw new Error('User not found in database');
        }

        return prisma.transcript.create({
            data: {
                meetingId,
                speakerId: dbUserId,
                text
            },
            include: {
                speaker: {
                    select: {
                        id: true,
                        clerkId: true,
                        name: true,
                        email: true
                    }
                }
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
            orderBy: { createdAt: 'asc' },
            include: {
                speaker: {
                    select: {
                        id: true,
                        clerkId: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async saveMOM(meetingId: string, momData: any) {
        return prisma.minuteOfMeeting.upsert({
            where: { meetingId },
            update: {
                meetingId,
                summary: momData.summary,
                keyPoints: momData.key_points || [],
                actionItems: momData.action_items || [],
                decisions: momData.decisions || []
            },
            create: {
                meetingId,
                summary: momData.summary,
                keyPoints: momData.key_points || [],
                actionItems: momData.action_items || [],
                decisions: momData.decisions || []
            }
        });
    }

    async getParticipants(meetingId: string) {
        return prisma.participant.findMany({
            where: { meetingId, leftAt: null },
            include: {
                user: {
                    select: {
                        id: true,
                        clerkId: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { joinedAt: 'asc' }
        });
    }
}
