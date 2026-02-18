import { ReactNode } from 'react'

interface AuthLayoutProps {
    children: ReactNode
    title: string
    subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left side - content/branding */}
            <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <div className="mb-8">
                        <h1 className="font-display text-4xl font-bold mb-4">HelpeR</h1>
                        <div className="h-1 w-20 bg-white/20 rounded-full" />
                    </div>

                    <h2 className="text-3xl font-bold mb-6 leading-tight">
                        Elevate your hiring process with AI-powered intelligence.
                    </h2>

                    <p className="text-white/70 text-lg leading-relaxed">
                        Join thousands of companies using HelpeR to streamline recruitment,
                        automate screening, and find the perfect candidates faster than ever before.
                    </p>
                </div>
            </div>

            {/* Right side - auth form */}
            <div className="flex w-full lg:w-1/2 bg-background items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="font-display text-3xl font-bold tracking-tight">
                            {title}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>

                    <div className="flex justify-center">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
