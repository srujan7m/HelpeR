import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export const getServerSession = async () => {
    const user = await currentUser()

    if (!user) {
        return null
    }

    // Fetch user from our database to get the role
    let dbUser = null
    try {
        dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: {
                id: true,
                role: true,
            },
        })
    } catch (error) {
        // Keep auth flow alive even if DB is temporarily unavailable.
        dbUser = null
    }

    return {
        user: {
            id: dbUser?.id || user.id, // Use DB ID if available, otherwise Clerk ID
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: dbUser?.role as Role || 'CANDIDATE',
        }
    }
}

export async function requireAuth() {
    const session = await getServerSession()

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    return session
}

export async function requireRole(role: Role) {
    const session = await requireAuth()

    if (session.user.role !== role) {
        throw new Error('Forbidden')
    }

    return session
}
