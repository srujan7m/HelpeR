'use client'

import { Bell, LogOut, Settings, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 md:ml-64">
        {/* Title */}
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Theme Toggle */}
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

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                J
              </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2 border-t border-border">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
