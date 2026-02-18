import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/',
    '/site',
    '/api/uploadthing',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/onboarding(.*)',
    '/api/webhooks(.*)',
    '/jobs(.*)',
    '/api/public(.*)',
])

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth()

    // For public routes, we don't need to do anything
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // If user is not signed in and trying to access a protected route
    if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url })
    }

    // REMOVED: Onboarding check moved to client-side (OnboardingGuard)
    // to avoid issues with session token metadata sync.

    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
