import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return sendError(new Error('Unauthorized'), 401)
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        })

        if (!user) {
            return sendError(new Error('User not found'), 404)
        }

        // Define filter based on role
        const appFilter = user.role === 'HR'
            ? { job: { createdById: user.id } }
            : { candidateId: user.id }

        const [
            totalApplications,
            shortlisted,
            interviews,
            recentActivity
        ] = await Promise.all([
            prisma.application.count({ where: appFilter }),
            prisma.application.count({
                where: { ...appFilter, status: 'SHORTLISTED' }
            }),
            prisma.application.count({
                where: { ...appFilter, status: 'INTERVIEW' }
            }),
            prisma.application.findMany({
                where: appFilter,
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    job: { select: { title: true } },
                    candidate: { select: { name: true, email: true } }
                }
            })
        ])

        return sendSuccess({
            stats: {
                totalApplications,
                shortlisted,
                interviews
            },
            recentActivity
        })
    } catch (error) {
        return sendError(error)
    }
}
