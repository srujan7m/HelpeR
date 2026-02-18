import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiResponse, apiError, withErrorHandler } from '@/lib/api-utils'
import { uploadTranscriptSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

async function handlePOST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireRole('HR')
    const { id } = await params

    const body = await req.json()
    const { transcript } = uploadTranscriptSchema.parse(body)

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    job: true,
                },
            },
        },
    })

    if (!interview) {
        return apiError('Interview not found', 404)
    }

    if (interview.application.job.createdById !== session.user.id) {
        return apiError('Forbidden', 403)
    }

    // Update interview with transcript
    const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
            transcript,
        },
        include: {
            application: {
                include: {
                    job: true,
                    candidate: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    })

    logger.info('Transcript uploaded', {
        interviewId: id,
        transcriptLength: transcript.length,
    })

    return apiResponse(updatedInterview, 'Transcript uploaded successfully')
}

export const POST = withErrorHandler(handlePOST)
