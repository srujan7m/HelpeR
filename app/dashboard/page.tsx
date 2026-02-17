import { Header } from '@/components/dashboard/header'
import { KPICard } from '@/components/dashboard/kpi-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Users, FileText, Video } from 'lucide-react'

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome back to your hiring dashboard"
      />
      <main className="p-6 md:p-8">
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              icon={Users}
              label="Total Applications"
              value="1,243"
              change="12.5% from last month"
              trend="up"
            />
            <KPICard
              icon={FileText}
              label="Shortlisted"
              value="128"
              change="8% from last month"
              trend="up"
            />
            <KPICard
              icon={Video}
              label="Interviews Scheduled"
              value="24"
              change="5 this week"
            />
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </main>
    </>
  )
}
