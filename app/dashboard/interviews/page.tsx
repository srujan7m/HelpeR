import { Header } from '@/components/dashboard/header'
import { Video, Download } from 'lucide-react'

const interviews = [
  {
    id: 1,
    name: 'Sarah Chen',
    position: 'Senior Developer',
    date: 'Feb 20, 2024',
    time: '2:00 PM',
    status: 'Scheduled',
  },
  {
    id: 2,
    name: 'John Smith',
    position: 'Product Manager',
    date: 'Feb 21, 2024',
    time: '10:00 AM',
    status: 'Scheduled',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    position: 'UX Designer',
    date: 'Feb 19, 2024',
    time: '3:30 PM',
    status: 'Completed',
  },
]

export default function InterviewsPage() {
  return (
    <>
      <Header
        title="Interviews"
        description="Schedule and manage candidate interviews"
      />
      <main className="p-6 md:p-8">
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <div>
            <h2 className="font-accent text-xl font-semibold text-foreground mb-4">
              Upcoming Interviews
            </h2>
            <div className="space-y-4">
              {interviews
                .filter((i) => i.status === 'Scheduled')
                .map((interview) => (
                  <div
                    key={interview.id}
                    className="p-6 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-accent text-lg font-semibold text-foreground">
                          {interview.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Position: {interview.position}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {interview.date} at {interview.time}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                        <Video className="w-4 h-4" />
                        Join Interview
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Completed Interviews */}
          <div>
            <h2 className="font-accent text-xl font-semibold text-foreground mb-4">
              Completed Interviews
            </h2>
            <div className="space-y-4">
              {interviews
                .filter((i) => i.status === 'Completed')
                .map((interview) => (
                  <div
                    key={interview.id}
                    className="p-6 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-accent text-lg font-semibold text-foreground">
                          {interview.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Position: {interview.position}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Completed on {interview.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-secondary transition-colors font-medium">
                          <Download className="w-4 h-4" />
                          Download MoM
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
