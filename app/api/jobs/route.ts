import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { createJobSchema } from '@/lib/validators'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return sendError(new Error('Unauthorized'), 401)
        }

        // Get the database user ID from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        })

        if (!user) {
            return sendError(new Error('User not found'), 404)
        }

        const body = await req.json()
        const validatedData = createJobSchema.parse(body)

        const job = await prisma.job.create({
            data: {
                ...validatedData,
                createdById: user.id,
            },
        })

        return sendSuccess(job, 201)
    } catch (error) {
        return sendError(error)
    }
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return sendError(new Error('Unauthorized'), 401)
        }

        // Get the database user ID from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        })

        if (!user) {
            return sendError(new Error('User not found'), 404)
        }

        const jobs = await prisma.job.findMany({
            where: {
                createdById: user.id, // Only show jobs created by the user
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: { applications: true },
                },
            },
        })

        return sendSuccess(jobs)
    } catch (error) {
        return sendError(error)
    }
}
