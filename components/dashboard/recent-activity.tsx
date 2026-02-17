const activities = [
  { id: 1, action: 'Application received', details: 'John Smith applied for Senior Developer', time: '2 hours ago' },
  { id: 2, action: 'Candidate shortlisted', details: 'Sarah Chen passed AI screening', time: '4 hours ago' },
  { id: 3, action: 'Interview scheduled', details: 'Mike Johnson - Interview on Feb 20', time: '1 day ago' },
  { id: 4, action: 'Resume screened', details: '24 resumes analyzed with AI', time: '2 days ago' },
]

export function RecentActivity() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <h3 className="font-accent text-lg font-semibold text-foreground mb-6">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex gap-4 py-3 border-b border-border last:border-0"
          >
            <div className="flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">
                {activity.action}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {activity.details}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
