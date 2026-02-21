'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        if (isLoaded) {
            // If user is not logged in, Clerk middleware/provider handles it (or let them pass if public)
            if (!user) {
                setChecking(false)
                return
            }

            const onboardingComplete = user.publicMetadata?.onboarding_complete === true
            const pendingOnboardingTimestamp =
                typeof window !== 'undefined'
                    ? Number(sessionStorage.getItem('onboarding_complete_pending_at') || 0)
                    : 0
            const withinPendingWindow =
                pendingOnboardingTimestamp > 0 && Date.now() - pendingOnboardingTimestamp < 60000

            // If onboarding is NOT complete
            if (!onboardingComplete) {
                // Allow temporary pass-through while metadata propagation catches up.
                if (withinPendingWindow && !pathname.startsWith('/onboarding')) {
                    setChecking(false)
                    return
                }
                // If they are not on onboarding page, redirect
                if (!pathname.startsWith('/onboarding')) {
                    router.replace('/onboarding')
                } else {
                    setChecking(false)
                }
            }
            // If onboarding IS complete
            else {
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('onboarding_complete_pending_at')
                }
                // If they are on onboarding page, redirect to dashboard
                if (pathname.startsWith('/onboarding')) {
                    router.replace('/dashboard')
                } else {
                    setChecking(false)
                }
            }
        }
    }, [user, isLoaded, pathname, router])

    if (!isLoaded || checking) {
        // Only show loader if we are actually checking a logged in user state or loading
        if (isLoaded && !user) return <>{children}</>

        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return <>{children}</>
}
