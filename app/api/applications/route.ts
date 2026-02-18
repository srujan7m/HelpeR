import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { createApplicationSchema } from '@/lib/validators'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return sendError(new Error('Unauthorized'), 401)

        // Get DB user
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        const body = await req.json()
        const validatedData = createApplicationSchema.parse(body)

        // Check if job exists
        const job = await prisma.job.findUnique({ where: { id: validatedData.jobId } })
        if (!job) return sendError(new Error('Job not found'), 404)

        // Check if already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId: validatedData.jobId,
                candidateId: user.id
            }
        })

        if (existingApplication) {
            return sendError(new Error('You have already applied for this job'), 409)
        }

        const application = await prisma.application.create({
            data: {
                ...validatedData,
                candidateId: user.id,
            },
            include: {
                job: { select: { title: true } }
            }
        })

        return sendSuccess(application, 201)
    } catch (error) {
        return sendError(error)
    }
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return sendError(new Error('Unauthorized'), 401)

        // Get DB user
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        let applications
        if (user.role === 'HR') {
            // HR sees applications for jobs they created
            applications = await prisma.application.findMany({
                where: {
                    job: {
                        createdById: user.id
                    }
                },
                include: {
                    candidate: {
                        select: { name: true, email: true }
                    },
                    job: {
                        select: { title: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        } else {
            // Candidates see their own applications
            applications = await prisma.application.findMany({
                where: {
                    candidateId: user.id
                },
                include: {
                    job: {
                        select: { title: true, createdBy: { select: { name: true } } }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        }

        return sendSuccess(applications)
    } catch (error) {
        return sendError(error)
    }
}
