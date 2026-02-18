import { SignUp } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function SignUpPage() {
    return (
        <AuthLayout
            title="Create an account"
            subtitle="Enter your email below to create your account"
        >
            <SignUp />
        </AuthLayout>
    )
}
