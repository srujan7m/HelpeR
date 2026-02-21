import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { extractTextFromPdf } from '@/lib/pdf'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { screenResume } from '@/lib/ai'
import type { ApplicationStatus } from '@prisma/client'

function isPdfFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function getEligibilityStatus(aiScore: { overallScore?: number; recommendation?: string } | null): ApplicationStatus {
    if (!aiScore) return 'APPLIED'

    const recommendation = aiScore.recommendation || ''
    const overallScore = aiScore.overallScore || 0
    const isEligibleRecommendation = ['STRONG_YES', 'YES', 'MAYBE'].includes(recommendation)
    const isEligibleScore = overallScore >= 60

    return isEligibleRecommendation || isEligibleScore ? 'SHORTLISTED' : 'REJECTED'
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const jobId = String(formData.get('jobId') || '').trim()
        const name = String(formData.get('name') || '').trim()
        const email = String(formData.get('email') || '').trim().toLowerCase()
        const file = formData.get('resume') as File

        if (!jobId || !name || !email || !file) {
            return sendError(new Error('Missing required fields'), 400)
        }

        if (!isPdfFile(file)) {
            return sendError(new Error('Only PDF resume files are allowed'), 400)
        }

        if (file.size > 10 * 1024 * 1024) {
            return sendError(new Error('Resume file must be less than 10MB'), 400)
        }

        // Validate Job exists
        const job = await prisma.job.findUnique({ where: { id: jobId } })
        if (!job) {
            return sendError(new Error('Job not found'), 404)
        }

        // Handle User (Candidate)
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    role: 'CANDIDATE',
                    clerkId: `guest_${uuidv4()}` // Placeholder for guest users
                }
            })
        }

        // Check if already applied
        const existingApp = await prisma.application.findFirst({
            where: {
                jobId,
                candidateId: user.id
            }
        })

        if (existingApp) {
            return sendError(new Error('You have already applied for this position'), 409)
        }

        // Process File
        const buffer = Buffer.from(await file.arrayBuffer())
        let extractedText = ''
        try {
            extractedText = await extractTextFromPdf(buffer)
        } catch (error) {
            console.error('Resume text extraction failed:', error)
        }

        // Save file locally (for demo purposes)
        const sanitizedOriginalName = file.name
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_')
        const fileName = `${uuidv4()}_${sanitizedOriginalName}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')

        await mkdir(uploadDir, { recursive: true })
        await writeFile(path.join(uploadDir, fileName), buffer)

        const resumeUrl = `/uploads/${fileName}`

        let aiScore: any = null
        let status: ApplicationStatus = 'APPLIED'
        const screeningText = `Candidate Name: ${name}
Candidate Email: ${email}

Resume:
${extractedText}`.trim()

        if (extractedText.trim()) {
            try {
                aiScore = await screenResume(screeningText, job.description)
                status = getEligibilityStatus(aiScore)
            } catch (error) {
                console.error('Auto-screening failed:', error)
            }
        }

        // Create Application
        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId: user.id,
                extractedText,
                resumeUrl,
                aiScore,
                status
            }
        })

        return sendSuccess(application, 201)

    } catch (error) {
        console.error('Application submission error:', error)
        return sendError(new Error('Failed to submit application'), 500)
    }
}
