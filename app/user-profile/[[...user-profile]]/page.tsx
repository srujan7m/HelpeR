import { UserProfile } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function UserProfilePage() {
    return (
        <AuthLayout
            title="Your Profile"
            subtitle="Manage your account settings and preferences"
        >
            <UserProfile path="/user-profile" />
        </AuthLayout>
    )
}
