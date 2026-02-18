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
        isHost
    })
}

export const GET = withErrorHandler(handleGET)
