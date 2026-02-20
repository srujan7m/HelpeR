'use client'

import { formatDistanceToNow } from 'date-fns'
import { useUiTranslations } from '@/hooks/use-ui-translations'

interface Activity {
  id: string
  status: string
  createdAt: string
  job: {
    title: string
  }
  candidate: {
    name: string | null
    email: string
  }
}

interface RecentActivityProps {
  activities?: Activity[]
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const { t } = useUiTranslations(
    'Recent Activity',
    'No recent activity',
    'Application for',
    'APPLIED',
    'SHORTLISTED',
    'INTERVIEW',
    'REJECTED'
  )

  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <h3 className="font-accent text-lg font-semibold text-foreground mb-6">
        {t('Recent Activity')}
      </h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('No recent activity')}</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 py-3 border-b border-border last:border-0"
            >
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">
                  {t('Application for')} {activity.job.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.candidate.name || activity.candidate.email} - {t(activity.status)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
