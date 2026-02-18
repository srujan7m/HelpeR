import { SignIn } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function SignInPage() {
    return (
        <AuthLayout
            title="Sign in to your account"
            subtitle="Enter your email below to login to your account"
        >
            <SignIn />
        </AuthLayout>
    )
}
