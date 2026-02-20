'use client'

import { Bell, Sun, Moon } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { useState, useEffect, ReactNode } from 'react'
import { useTheme } from 'next-themes'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useUiTranslations } from '@/hooks/use-ui-translations'

interface HeaderProps {
  title: ReactNode
  description?: ReactNode
}

export function Header({ title, description }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const titleText = typeof title === 'string' ? title : ''
  const descriptionText = typeof description === 'string' ? description : ''
  const { t } = useUiTranslations(titleText, descriptionText)

  useEffect(() => {
    setMounted(true)
  }, [])

  const translatedTitle = typeof title === 'string' ? t(title) : title
  const translatedDescription =
    typeof description === 'string' ? t(description) : description

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 md:ml-64">
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {translatedTitle}
          </h1>
          {translatedDescription && (
            <p className="text-sm text-muted-foreground">{translatedDescription}</p>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher />

          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          )}

          <UserButton
            afterSignOutUrl="/"
            userProfileMode="navigation"
            userProfileUrl="/user-profile"
          />
        </div>
      </div>
    </header>
  )
}
