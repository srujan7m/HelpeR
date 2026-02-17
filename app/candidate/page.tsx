import { Header } from '@/components/dashboard/header'
import { Download, CheckCircle, Clock, XCircle } from 'lucide-react'

const appliedJobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    status: 'Interview Scheduled',
    appliedDate: 'Feb 10, 2024',
    interviewDate: 'Feb 20, 2024',
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'InnovateLabs',
    status: 'Under Review',
    appliedDate: 'Feb 8, 2024',
    interviewDate: null,
  },
  {
    id: 3,
    title: 'UX Designer',
    company: 'Creative Agency',
    status: 'Rejected',
    appliedDate: 'Feb 1, 2024',
    interviewDate: null,
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'Interview Scheduled':
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'Under Review':
      return <Clock className="w-5 h-5 text-blue-600" />
    case 'Rejected':
      return <XCircle className="w-5 h-5 text-red-600" />
    default:
      return null
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Interview Scheduled':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'Under Review':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default function CandidatePage() {
  return (
    <>
      <Header
        title="My Applications"
        description="Track your job applications and interview progress"
      />
      <main className="p-6 md:p-8">
        <div className="space-y-6">
          {appliedJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-colors"
            >
              <div className="flex flex-col gap-4">
                {/* Job Title and Company */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-accent text-lg font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {getStatusIcon(job.status)}
                    {job.status}
                  </span>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Applied</p>
                    <p className="text-sm font-medium text-foreground">
                      {job.appliedDate}
                    </p>
                  </div>
                  {job.interviewDate && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Interview</p>
                      <p className="text-sm font-medium text-foreground">
                        {job.interviewDate}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  {job.status === 'Interview Scheduled' && (
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                      Download Minutes of Meeting
                    </button>
                  )}
                  {job.status === 'Under Review' && (
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if no applications */}
        {appliedJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't applied to any jobs yet
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Browse Jobs
            </a>
          </div>
        )}
      </main>
    </>
  )
}
