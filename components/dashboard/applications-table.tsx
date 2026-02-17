import { MoreHorizontal } from 'lucide-react'

const applications = [
  {
    id: 1,
    name: 'John Smith',
    score: 92,
    status: 'Shortlisted',
    appliedDate: 'Feb 15, 2024',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    score: 88,
    status: 'Interview Scheduled',
    appliedDate: 'Feb 14, 2024',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    score: 76,
    status: 'Under Review',
    appliedDate: 'Feb 13, 2024',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    score: 85,
    status: 'Shortlisted',
    appliedDate: 'Feb 12, 2024',
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case 'Shortlisted':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'Interview Scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function ApplicationsTable() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Candidate Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                AI Score
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Applied Date
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {app.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 max-w-xs">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${app.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {app.score}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {app.appliedDate}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
