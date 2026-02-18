import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { apiResponse, apiError, withErrorHandler } from '@/lib/api-utils'

async function handleGET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAuth()
    const { id } = await params

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    job: {
                        include: {
                            createdBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
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

    if (!interview) {
        return apiError('Interview not found', 404)
    }

    // Check access permissions
    if (
        session.user.role === 'HR' &&
        interview.application.job.createdById !== session.user.id
    ) {
        return apiError('Forbidden', 403)
    }

    if (
        session.user.role === 'CANDIDATE' &&
        interview.application.candidateId !== session.user.id
    ) {
        return apiError('Forbidden', 403)
    }

    return apiResponse(interview)
}

export const GET = withErrorHandler(handleGET)
