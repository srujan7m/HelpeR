import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiResponse, apiError, withErrorHandler } from '@/lib/api-utils'
import { generateMoM } from '@/lib/ai'
import { generateMomPdf } from '@/lib/pdf'
import { uploadMomPdf } from '@/lib/supabase'
import { logger } from '@/lib/logger'

async function handlePOST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireRole('HR')
    const { id } = await params

    const interview = await prisma.interview.findUnique({
        where: { id },
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

    if (!interview) {
        return apiError('Interview not found', 404)
    }

    if (interview.application.job.createdById !== session.user.id) {
        return apiError('Forbidden', 403)
    }

    if (!interview.transcript) {
        return apiError('Transcript not available', 400)
    }

    // Use translated transcript if available, otherwise use original
    const transcriptToAnalyze = interview.translatedTranscript || interview.transcript

    // Generate MoM using AI
    const resumeSummary = interview.application.extractedText?.substring(0, 500) || ''
    const momData = await generateMoM(
        transcriptToAnalyze,
        interview.application.job.description,
        resumeSummary
    )

    // Generate PDF
    const pdfBuffer = await generateMomPdf(momData)

    // Upload PDF to Supabase
    const momPdfUrl = await uploadMomPdf(pdfBuffer, interview.id)

    // Update interview with MoM
    const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
            momText: JSON.stringify(momData),
            momPdfUrl,
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

    logger.info('MoM generated', {
        interviewId: id,
        pdfUrl: momPdfUrl,
    })

    return apiResponse(
        { interview: updatedInterview, mom: momData, pdfUrl: momPdfUrl },
        'Minutes of Meeting generated successfully'
    )
}

export const POST = withErrorHandler(handlePOST)
