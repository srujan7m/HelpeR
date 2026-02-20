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
exports.MeetingService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MeetingService {
    resolveDbUserId(userIdOrClerkId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield prisma.user.findFirst({
                where: {
                    OR: [{ id: userIdOrClerkId }, { clerkId: userIdOrClerkId }]
                },
                select: { id: true }
            });
            return (_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : null;
        });
    }
    createMeeting(userId, title) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.meeting.create({
                data: {
                    title,
                    createdById: userId,
                    status: 'SCHEDULED'
                }
            });
        });
    }
    joinMeeting(meetingId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbUserId = yield this.resolveDbUserId(userId);
            if (!dbUserId) {
                throw new Error('User not found in database');
            }
            // Check if participant already exists
            const existing = yield prisma.participant.findFirst({
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
            if (existing)
                return existing;
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
        });
    }
    saveTranscript(meetingId, userId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbUserId = yield this.resolveDbUserId(userId);
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
        });
    }
    endMeeting(meetingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.meeting.update({
                where: { id: meetingId },
                data: {
                    status: 'COMPLETED',
                    endedAt: new Date()
                }
            });
        });
    }
    getTranscripts(meetingId) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    saveMOM(meetingId, momData) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    getParticipants(meetingId) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.MeetingService = MeetingService;
