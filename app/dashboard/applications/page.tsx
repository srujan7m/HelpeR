import { Header } from '@/components/dashboard/header'
import { ApplicationsTable } from '@/components/dashboard/applications-table'

export default function ApplicationsPage() {
  return (
    <>
      <Header
        title="Applications"
        description="Review and manage all candidate applications"
      />
      <main className="p-6 md:p-8">
        <div className="mb-8">
          <h2 className="font-accent text-xl font-semibold text-foreground">
            All Applications
          </h2>
        </div>

        {/* Applications Table */}
        <ApplicationsTable />
      </main>
    </>
  )
}
