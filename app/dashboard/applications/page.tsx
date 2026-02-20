'use client'

import { Header } from '@/components/dashboard/header'
import { ApplicationsTable } from '@/components/dashboard/applications-table'
import { useUiTranslations } from '@/hooks/use-ui-translations'

export default function ApplicationsPage() {
  const { t } = useUiTranslations(
    'Applications',
    'Review and manage all candidate applications',
    'All Applications'
  )

  return (
    <>
      <Header
        title="Applications"
        description="Review and manage all candidate applications"
      />
      <main className="p-6 md:p-8">
        <div className="mb-8">
          <h2 className="font-accent text-xl font-semibold text-foreground">
            {t('All Applications')}
          </h2>
        </div>

        <ApplicationsTable />
      </main>
    </>
  )
}
