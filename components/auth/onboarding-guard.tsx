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

            // If onboarding is NOT complete
            if (!onboardingComplete) {
                // If they are not on onboarding page, redirect
                if (!pathname.startsWith('/onboarding')) {
                    router.push('/onboarding')
                } else {
                    setChecking(false)
                }
            }
            // If onboarding IS complete
            else {
                // If they are on onboarding page, redirect to dashboard
                if (pathname.startsWith('/onboarding')) {
                    router.push('/dashboard')
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
