import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!job) {
            return sendError(new Error('Job not found'), 404)
        }

        return sendSuccess(job)
    } catch (error) {
        return sendError(error)
    }
}
