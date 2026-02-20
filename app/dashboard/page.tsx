'use client'

import { Header } from '@/components/dashboard/header'
import { KPICard } from '@/components/dashboard/kpi-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Users, FileText, Video, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useUiTranslations } from '@/hooks/use-ui-translations'

interface DashboardStats {
  stats: {
    totalApplications: number
    shortlisted: number
    interviews: number
  }
  recentActivity: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useUiTranslations(
    'Failed to load dashboard stats',
    'Dashboard',
    'Welcome to your HelpeR dashboard',
    'Total Applications',
    'All time',
    'Shortlisted',
    'Candidates ready',
    'Interviews Scheduled',
    'Upcoming'
  )

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          toast.error(t('Failed to load dashboard stats'))
        }
      } catch (error) {
        toast.error(t('Failed to load dashboard stats'))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome to your HelpeR dashboard"
      />
      <main className="p-6 md:p-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              icon={Users}
              label={t('Total Applications')}
              value={data?.stats.totalApplications.toString() || '0'}
              change={t('All time')}
            />
            <KPICard
              icon={FileText}
              label={t('Shortlisted')}
              value={data?.stats.shortlisted.toString() || '0'}
              change={t('Candidates ready')}
              trend="up"
            />
            <KPICard
              icon={Video}
              label={t('Interviews Scheduled')}
              value={data?.stats.interviews.toString() || '0'}
              change={t('Upcoming')}
            />
          </div>

          <RecentActivity activities={data?.recentActivity} />
        </div>
      </main>
    </>
  )
}
