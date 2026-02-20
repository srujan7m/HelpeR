'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Video,
  Settings,
  Menu,
  X,
  Calendar,
} from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'
import { useState } from 'react'
import { useUiTranslations } from '@/hooks/use-ui-translations'

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Briefcase, label: 'Jobs', href: '/dashboard/jobs' },
  { icon: Users, label: 'Applications', href: '/dashboard/applications' },
  { icon: Video, label: 'Interviews', href: '/dashboard/interviews' },
  { icon: Calendar, label: 'Meetings', href: '/dashboard/meetings' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useUiTranslations(
    'Log Out',
    ...menuItems.map((item) => item.label)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === href) return true
    if (href !== '/dashboard' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg hover:bg-secondary"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border transition-all duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-full flex flex-col p-6">
          <Link href="/dashboard" className="font-display text-2xl font-bold text-foreground mb-8">
            HelpeR
          </Link>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{t(item.label)}</span>
                </Link>
              )
            })}
          </nav>

          <div className="pt-6 border-t border-border">
            <SignOutButton>
              <button className="w-full px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
                {t('Log Out')}
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
