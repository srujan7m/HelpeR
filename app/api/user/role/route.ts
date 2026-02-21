import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendError } from '@/lib/api-response'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'

const roleSchema = z.object({
    role: z.enum(['HR', 'CANDIDATE']),
})

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return sendError(new Error('Unauthorized'), 401)
        }

        const body = await req.json()
        const { role } = roleSchema.parse(body)

        // 1. Update/Create user in Prisma
        // We use upsert because the webhook might have failed or been delayed
        const user = await clerkClient()
        const clerkUser = await user.users.getUser(userId)
        const email = clerkUser.emailAddresses[0]?.emailAddress

        if (!email) {
            return sendError(new Error('Email not found in Clerk profile'), 400)
        }

        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

        const existingByClerkId = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true },
        })

        let dbUser
        if (existingByClerkId) {
            dbUser = await prisma.user.update({
                where: { clerkId: userId },
                data: { role, email, name },
            })
        } else {
            const existingByEmail = await prisma.user.findUnique({
                where: { email },
                select: { id: true },
            })

            if (existingByEmail) {
                dbUser = await prisma.user.update({
                    where: { email },
                    data: { clerkId: userId, role, name },
                })
            } else {
                dbUser = await prisma.user.create({
                    data: {
                        clerkId: userId,
                        email,
                        name,
                        role,
                    },
                })
            }
        }

        // 2. Update Clerk Metadata
        // This allows middleware to access the role without hitting the DB
        await user.users.updateUserMetadata(userId, {
            publicMetadata: {
                role,
                onboarding_complete: true
            },
        })

        return sendSuccess({
            user: dbUser,
            message: 'Role updated successfully'
        })
    } catch (error) {
        return sendError(error)
    }
}
