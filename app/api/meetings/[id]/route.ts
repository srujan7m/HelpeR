import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError, withErrorHandler } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

async function handleGET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await requireAuth()

    const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            participants: {
                where: { leftAt: null },
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
            },
            transcripts: {
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
            },
            mom: true
        }
    })

    if (!meeting) {
        return apiError('Meeting not found', 404)
    }

    // Access control: Only allow if user is creator OR user is a participant (implied by having the link for now, 
    // but ideally we check if they are the candidate in the associated interview).
    // For now, we'll allow authenticated users to view info if they have the ID, 
    // but we can refine this by checking the Interview table.

    const isHost = meeting.createdById === session.user.id

    return apiResponse({
        ...meeting,
        participants: meeting.participants.map((participant) => ({
            id: participant.user.id,
            clerkId: participant.user.clerkId,
            name: participant.user.name || participant.user.email || 'Participant'
        })),
        transcripts: meeting.transcripts.map((transcript) => ({
            id: transcript.id,
            speakerId: transcript.speaker.clerkId || transcript.speaker.id,
            speakerName: transcript.speaker.name || transcript.speaker.email || 'Participant',
            text: transcript.text,
            timestamp: transcript.createdAt
        })),
        isHost
    })
}

export const GET = withErrorHandler(handleGET)
