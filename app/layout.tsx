import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono, Funnel_Display, Poiret_One } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

import './globals.css'

const _geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })
const _funnelDisplay = Funnel_Display({ subsets: ['latin'], variable: '--font-display', weight: '400' })
const _poiretOne = Poiret_One({ subsets: ['latin'], variable: '--font-accent', weight: '400' })

import { OnboardingGuard } from '@/components/auth/onboarding-guard'

// ... existing imports

export const metadata: Metadata = {
  title: 'HelpeR - AI Hiring OS',
  description: 'Premium AI-powered hiring platform for streamlined recruitment and talent management',
  generator: 'v0.app',
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${_geist.variable} ${_geistMono.variable} ${_funnelDisplay.variable} ${_poiretOne.variable}`} suppressHydrationWarning>
        <body className="font-sans antialiased" suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <OnboardingGuard>
              {children}
            </OnboardingGuard>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
