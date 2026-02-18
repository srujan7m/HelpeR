import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return sendError(new Error('Unauthorized'), 401)

        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        // Fetch meetings created by user or where user is participant
        // For simplicity, fetching meetings created by user
        const meetings = await prisma.meeting.findMany({
            where: {
                createdById: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return sendSuccess(meetings)
    } catch (error) {
        return sendError(error)
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return sendError(new Error('Unauthorized'), 401)

        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) return sendError(new Error('User not found'), 404)

        const body = await req.json()
        const { title, type } = body

        const meeting = await prisma.meeting.create({
            data: {
                title: title || 'Untitled Meeting',
                type: type || 'INSTANT',
                status: 'SCHEDULED',
                createdById: user.id
            }
        })

        return sendSuccess(meeting, 201)
    } catch (error) {
        return sendError(error)
    }
}
