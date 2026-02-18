import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { updateJobSchema } from '@/lib/validators'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
            },
        })

        if (!job) {
            return sendError(new Error('Job not found'), 404)
        }

        return sendSuccess(job)
    } catch (error) {
        return sendError(error)
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return sendError(new Error('Unauthorized'), 401)
        }

        // Get DB user
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        const { id } = await params
        const job = await prisma.job.findUnique({ where: { id } })

        if (!job) {
            return sendError(new Error('Job not found'), 404)
        }

        if (job.createdById !== user.id) {
            return sendError(new Error('Forbidden'), 403)
        }

        const body = await req.json()
        const validatedData = updateJobSchema.parse(body)

        const updatedJob = await prisma.job.update({
            where: { id },
            data: validatedData,
        })

        return sendSuccess(updatedJob)
    } catch (error) {
        return sendError(error)
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return sendError(new Error('Unauthorized'), 401)
        }

        // Get DB user
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        const { id } = await params
        const job = await prisma.job.findUnique({ where: { id } })

        if (!job) {
            return sendError(new Error('Job not found'), 404)
        }

        if (job.createdById !== user.id) {
            return sendError(new Error('Forbidden'), 403)
        }

        await prisma.job.delete({
            where: { id },
        })

        return sendSuccess({ message: 'Job deleted successfully' })
    } catch (error) {
        return sendError(error)
    }
}
