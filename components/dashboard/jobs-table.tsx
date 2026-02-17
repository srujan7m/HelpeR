import { MoreHorizontal } from 'lucide-react'

const jobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    created: 'Feb 10, 2024',
    applications: 34,
    status: 'Active',
  },
  {
    id: 2,
    title: 'Product Manager',
    created: 'Feb 5, 2024',
    applications: 28,
    status: 'Active',
  },
  {
    id: 3,
    title: 'UX Designer',
    created: 'Jan 28, 2024',
    applications: 19,
    status: 'Closed',
  },
  {
    id: 4,
    title: 'Data Analyst',
    created: 'Jan 15, 2024',
    applications: 42,
    status: 'Active',
  },
]

export function JobsTable() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Applications
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {job.title}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {job.created}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {job.applications}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {job.status}
                  </span>
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
