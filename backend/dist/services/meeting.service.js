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
            // Check if participant already exists
            const existing = yield prisma.participant.findFirst({
                where: { meetingId, userId }
            });
            if (existing)
                return existing;
            return prisma.participant.create({
                data: {
                    meetingId,
                    userId
                }
            });
        });
    }
    saveTranscript(meetingId, userId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.transcript.create({
                data: {
                    meetingId,
                    speakerId: userId,
                    text
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
                orderBy: { createdAt: 'asc' }
            });
        });
    }
    saveMOM(meetingId, momData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.minuteOfMeeting.create({
                data: {
                    meetingId,
                    summary: momData.summary,
                    keyPoints: momData.key_points || [],
                    actionItems: momData.action_items || [],
                    decisions: momData.decisions || []
                }
            });
        });
    }
}
exports.MeetingService = MeetingService;
