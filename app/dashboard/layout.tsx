import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <div className="md:ml-64">
        {children}
      </div>
    </div>
  )
}
