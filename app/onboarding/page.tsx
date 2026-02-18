'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Loader2, User, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function OnboardingPage() {
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState<'CANDIDATE' | 'HR' | null>(null)

    const handleRoleSelect = async () => {
        if (!selectedRole) return

        setLoading(true)
        try {
            const response = await fetch('/api/user/role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole }),
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Profile updated successfully!')
                // Force a reload to refresh the session token with new metadata
                await user?.reload()
                router.push('/dashboard')
                router.refresh()
            } else {
                throw new Error(result.error || 'Failed to update profile')
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <AuthLayout
            title="Welcome to HelpeR"
            subtitle="Select your role to get started"
        >
            <div className="w-full space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setSelectedRole('CANDIDATE')}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${selectedRole === 'CANDIDATE'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                    >
                        <User className={`w-12 h-12 mb-4 ${selectedRole === 'CANDIDATE' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                        <h3 className="font-semibold text-foreground">Candidate</h3>
                        <p className="text-sm text-center text-muted-foreground mt-2">
                            I am looking for a job
                        </p>
                    </button>

                    <button
                        onClick={() => setSelectedRole('HR')}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${selectedRole === 'HR'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                    >
                        <Briefcase className={`w-12 h-12 mb-4 ${selectedRole === 'HR' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                        <h3 className="font-semibold text-foreground">Recruiter / HR</h3>
                        <p className="text-sm text-center text-muted-foreground mt-2">
                            I am hiring talent
                        </p>
                    </button>
                </div>

                <Button
                    onClick={handleRoleSelect}
                    disabled={!selectedRole || loading}
                    className="w-full h-12 text-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Setting up your profile...
                        </>
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>
        </AuthLayout>
    )
}
