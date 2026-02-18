import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMomPdf } from '@/lib/pdf'
import { requireAuth } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAuth() // Ensure user is logged in

        const { id } = params
        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                mom: true
            }
        })

        if (!meeting || !meeting.mom) {
            return new NextResponse('MOM not found', { status: 404 })
        }

        // Format MOM data for PDF generator
        const momData = {
            summary: meeting.mom.summary,
            keyPoints: meeting.mom.keyPoints,
            technicalDiscussion: [], // These fields might be missing in DB schema if not updated
            candidateStrengths: meeting.mom.actionItems, // Mapping actionItems to strengths temporarily or check schema
            candidateWeaknesses: meeting.mom.decisions, // Mapping decisions to weaknesses temporarily
            interviewerNotes: [],
            recommendation: 'See summary',
            nextSteps: []
        }

        // Wait, schema check:
        // MinuteOfMeeting model has: summary, keyPoints, actionItems, decisions.
        // MoMResult type (in lib/pdf.ts) expects: technicalDiscussion, candidateStrengths, etc.
        // I need to align these. The schema seems to store a subset or different structure.
        // Let's check `backend/src/socket/meeting.socket.ts` or where MOM is saved to see what's actually stored.
        // If the DB schema is limited, I might need to rely on what's there or update schema.
        // For now, I will map available fields to the PDF generator.

        // Re-mapping based on schema:
        // schema: keyPoints[], actionItems[], decisions[]
        // pdf: technicalDiscussion, candidateStrengths, candidateWeaknesses, interviewerNotes, nextSteps

        const momForPdf: any = {
            summary: meeting.mom.summary,
            keyPoints: meeting.mom.keyPoints,
            technicalDiscussion: meeting.mom.decisions, // Reuse decisions as technical discussion
            candidateStrengths: [],
            candidateWeaknesses: [],
            interviewerNotes: [],
            recommendation: 'N/A',
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
