'use client'

import * as React from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

export function SignUpForm() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        setLoading(true)
        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            })

            // Send the email.
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            setPendingVerification(true)
            toast.success('Check your email for a verification code')
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
            toast.error(err.errors[0]?.longMessage || 'Failed to sign up')
        } finally {
            setLoading(false)
        }
    }

    const onPressVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        setLoading(true)
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (completeSignUp.status !== 'complete') {
                console.log(JSON.stringify(completeSignUp, null, 2))
                toast.error('Verification failed. Please try again.')
            }

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId })
                router.push('/onboarding')
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
            toast.error(err.errors[0]?.longMessage || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    if (pendingVerification) {
        return (
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-medium">Verify your email</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        We sent a code to <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>
                <form onSubmit={onPressVerify} className="space-y-4">
                    <div className="flex justify-center">
                        <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <Button className="w-full" type="submit" disabled={loading || code.length < 6}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Email'
                        )}
                    </Button>
                </form>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="bg-background"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background"
                    />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        'Sign Up'
                    )}
                </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/sign-in" className="font-medium text-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </div>
    )
}
