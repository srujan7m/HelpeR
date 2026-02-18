import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { updateApplicationStatusSchema } from '@/lib/validators'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth()
        if (!userId) return sendError(new Error('Unauthorized'), 401)

        // Get DB user
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        const { id } = await params
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: true,
                candidate: { select: { name: true, email: true } },
                interview: true
            }
        })

        if (!application) return sendError(new Error('Application not found'), 404)

        // Authorization: HR can see if they own the job, Candidate can see if it's theirs
        if (user.role === 'HR') {
            const job = await prisma.job.findUnique({ where: { id: application.jobId } })
            if (job?.createdById !== user.id) return sendError(new Error('Forbidden'), 403)
        } else {
            if (application.candidateId !== user.id) return sendError(new Error('Forbidden'), 403)
        }

        return sendSuccess(application)
    } catch (error) {
        return sendError(error)
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth()
        if (!userId) return sendError(new Error('Unauthorized'), 401)

        // Get DB user
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        // Only HR can update status
        if (user.role !== 'HR') return sendError(new Error('Forbidden'), 403)

        const { id } = await params
        const application = await prisma.application.findUnique({
            where: { id },
            include: { job: true }
        })

        if (!application) return sendError(new Error('Application not found'), 404)
        if (application.job.createdById !== user.id) return sendError(new Error('Forbidden'), 403)

        const body = await req.json()
        const validatedData = updateApplicationStatusSchema.parse(body)

        const updatedApplication = await prisma.application.update({
            where: { id },
            data: { status: validatedData.status },
        })

        return sendSuccess(updatedApplication)
    } catch (error) {
        return sendError(error)
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth()
        if (!userId) return sendError(new Error('Unauthorized'), 401)

        // Get DB user
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        const { id } = await params
        const application = await prisma.application.findUnique({
            where: { id },
            include: { job: true }
        })

        if (!application) return sendError(new Error('Application not found'), 404)

        // Allow deletion if Candidate owns it OR if HR owns the job
        const isCandidate = application.candidateId === user.id
        const isJobOwner = application.job.createdById === user.id

        if (!isCandidate && !isJobOwner) {
            return sendError(new Error('Forbidden'), 403)
        }

        await prisma.application.delete({
            where: { id },
        })

        return sendSuccess({ message: 'Application deleted successfully' })
    } catch (error) {
        return sendError(error)
    }
}
