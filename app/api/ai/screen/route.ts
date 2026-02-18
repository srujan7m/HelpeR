import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiResponse, apiError, withErrorHandler } from '@/lib/api-utils'
import { screenResume } from '@/lib/ai'
import { screenResumeSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

async function handlePOST(req: NextRequest) {
    const session = await requireRole('HR')

    const body = await req.json()
    const { applicationId, keywords } = screenResumeSchema.parse(body)

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
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

    if (!application.extractedText) {
        return apiError('Resume text not available', 400)
    }

    // Use translated text if available, otherwise use extracted text
    const textToAnalyze = application.translatedText || application.extractedText

    // Screen resume using AI
    const aiScore = await screenResume(textToAnalyze, application.job.description, keywords)

    // Update application with AI score
    const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: {
            aiScore: aiScore as any,
        },
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
    })

    logger.info('Resume screened', {
        applicationId,
        score: aiScore.overallScore,
        recommendation: aiScore.recommendation,
    })

    return apiResponse(
        { application: updatedApplication, aiScore },
        'Resume screened successfully'
    )
}

export const POST = withErrorHandler(handlePOST)
