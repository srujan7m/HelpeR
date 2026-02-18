import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { extractTextFromPdf } from '@/lib/pdf'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const jobId = formData.get('jobId') as string
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const file = formData.get('resume') as File

        if (!jobId || !name || !email || !file) {
            return sendError(new Error('Missing required fields'), 400)
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
        const extractedText = await extractTextFromPdf(buffer)

        // Save file locally (for demo purposes)
        const fileName = `${uuidv4()}_${file.name}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')

        try {
            await mkdir(uploadDir, { recursive: true })
            await writeFile(path.join(uploadDir, fileName), buffer)
        } catch (e) {
            console.error('File save error:', e)
            // Continue even if file save fails, as long as we have text
        }

        const resumeUrl = `/uploads/${fileName}`

        // Create Application
        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId: user.id,
                extractedText,
                resumeUrl,
                status: 'APPLIED'
            }
        })

        return sendSuccess(application, 201)

    } catch (error) {
        console.error('Application submission error:', error)
        return sendError(new Error('Failed to submit application'), 500)
    }
}
