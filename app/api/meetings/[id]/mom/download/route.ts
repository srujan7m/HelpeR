import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMomPdf } from '@/lib/pdf'
import { requireAuth } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth() // Ensure user is logged in

        const { id } = await params
        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                mom: true
            }
        })

        if (!meeting || !meeting.mom) {
            return new NextResponse('MOM not found', { status: 404 })
        }

        const momForPdf = {
            summary: meeting.mom.summary,
            keyPoints: meeting.mom.keyPoints,
            technicalDiscussion: meeting.mom.decisions,
            candidateStrengths: [],
            candidateWeaknesses: [],
            interviewerNotes: [],
            recommendation: 'See meeting summary and action items.',
            nextSteps: meeting.mom.actionItems
        }

        const buffer = await generateMomPdf(momForPdf)

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="MOM-${meeting.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`
            }
        })

    } catch (error) {
        console.error('PDF Generation Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

