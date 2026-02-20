'use client'

import { Header } from '@/components/dashboard/header'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useUiTranslations } from '@/hooks/use-ui-translations'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    language: 'English',
  })
  const { t } = useUiTranslations(
    'Settings',
    'Manage your account and preferences',
    'Profile Settings',
    'Full Name',
    'Email Address',
    'Preferred Language',
    'Save Changes',
    'Change Password',
    'Current Password',
    'New Password',
    'Confirm New Password',
    'Update Password',
    'Delete Account',
    'Permanently delete your account and all associated data. This action cannot be undone.'
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <>
      <Header
        title="Settings"
        description="Manage your account and preferences"
      />
      <main className="p-6 md:p-8 max-w-2xl">
        <div className="space-y-8">
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-accent text-xl font-semibold text-foreground mb-6">
              {t('Profile Settings')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('Full Name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('Email Address')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('Preferred Language')}
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                {t('Save Changes')}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-accent text-xl font-semibold text-foreground mb-6">
              {t('Change Password')}
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('Current Password')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('New Password')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('Confirm New Password')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                {t('Update Password')}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-accent font-semibold text-foreground mb-2">
                  {t('Delete Account')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('Permanently delete your account and all associated data. This action cannot be undone.')}
                </p>
                <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                  {t('Delete Account')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
