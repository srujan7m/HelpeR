import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { apiResponse, apiError, withErrorHandler } from '@/lib/api-utils'
import { scheduleInterviewSchema } from '@/lib/validations'
import { createCalendarEvent } from '@/lib/google'
import { sendInterviewInvitation } from '@/lib/email'
import { logger } from '@/lib/logger'

async function handlePOST(req: NextRequest) {
    const session = await requireRole('HR')

    const body = await req.json()
    const validatedData = scheduleInterviewSchema.parse(body)

    const application = await prisma.application.findUnique({
        where: { id: validatedData.applicationId },
        include: {
            job: true,
        },
    })

    if (!application) {
        return apiError('Application not found', 404)
    }

    if (application.job.createdById !== session.user.id) {
        return apiError('Forbidden', 403)
    }

    // Check if interview already exists
    const existingInterview = await prisma.interview.findUnique({
        where: { applicationId: validatedData.applicationId },
    })

    if (existingInterview) {
        return apiError('Interview already scheduled', 400)
    }

    // Create Meeting Session
    const meeting = await prisma.meeting.create({
        data: {
            title: `Interview: ${validatedData.jobTitle} - ${validatedData.candidateName}`,
            createdById: session.user.id,
            status: 'SCHEDULED',
            type: 'INTERVIEW'
        }
    })

    const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/meeting/${meeting.id}`

    // Create Google Calendar event
    const scheduledAt = new Date(validatedData.scheduledAt)
    let eventId: string | null = null

    try {
        const calendarResult = await createCalendarEvent(
            validatedData.candidateEmail,
            validatedData.candidateName,
            validatedData.jobTitle,
            scheduledAt,
            meetingLink
        )
        eventId = calendarResult.eventId
    } catch (error) {
        logger.warn('Failed to create Google Calendar event', { error })
        // Continue without Google Calendar event
    }

    // Create interview record
    const interview = await prisma.interview.create({
        data: {
            applicationId: validatedData.applicationId,
            scheduledAt,
            googleEventId: eventId,
            meetingLink,
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

    // Update application status
    await prisma.application.update({
        where: { id: validatedData.applicationId },
        data: { status: 'INTERVIEW' },
    })

    // Send invitation email
    await sendInterviewInvitation(
        validatedData.candidateEmail,
        validatedData.candidateName,
        validatedData.jobTitle,
        scheduledAt,
        meetingLink
    )

    logger.info('Interview scheduled', {
        interviewId: interview.id,
        applicationId: validatedData.applicationId,
        scheduledAt: scheduledAt.toISOString(),
        meetingId: meeting.id
    })

    return apiResponse(interview, 'Interview scheduled successfully')
}

async function handleGET(req: NextRequest) {
    const session = await requireAuth()

    let interviews

    if (session.user.role === 'HR') {
        interviews = await prisma.interview.findMany({
            where: {
                application: {
                    job: {
                        createdById: session.user.id,
                    },
                },
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
            orderBy: {
                scheduledAt: 'asc',
            },
        })
    } else {
        interviews = await prisma.interview.findMany({
            where: {
                application: {
                    candidateId: session.user.id,
                },
            },
            include: {
                application: {
                    include: {
                        job: {
                            include: {
                                createdBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        })
    }

    return apiResponse(interviews)
}

export const POST = withErrorHandler(handlePOST)
export const GET = withErrorHandler(handleGET)
