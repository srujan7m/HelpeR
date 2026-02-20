'use client'

import { Header } from '@/components/dashboard/header'
import { Video, FileText, Calendar, Clock, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useUiTranslations } from '@/hooks/use-ui-translations'

interface Interview {
  id: string
  scheduledAt: string
  meetingLink: string | null
  application: {
    job: {
      title: string
    }
    candidate: {
      name: string
    }
  }
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useUiTranslations(
    'Failed to fetch interviews',
    'Interviews',
    'Schedule and manage candidate interviews',
    'Upcoming Interviews',
    'No upcoming interviews scheduled.',
    'Candidate',
    'Join Interview',
    'Past Interviews',
    'No past interviews.',
    'View MoM',
    'Download'
  )

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch('/api/interviews')
        const data = await res.json()
        if (data.success) {
          setInterviews(data.data)
        }
      } catch (error) {
        toast.error(t('Failed to fetch interviews'))
      } finally {
        setLoading(false)
      }
    }
    fetchInterviews()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const upcomingInterviews = interviews.filter((i) => new Date(i.scheduledAt) > new Date())
  const pastInterviews = interviews.filter((i) => new Date(i.scheduledAt) <= new Date())

  return (
    <>
      <Header
        title="Interviews"
        description="Schedule and manage candidate interviews"
      />
      <main className="p-6 md:p-8">
        <div className="space-y-8">
          <div>
            <h2 className="font-accent text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('Upcoming Interviews')}
            </h2>
            {upcomingInterviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('No upcoming interviews scheduled.')}</p>
            ) : (
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-accent text-lg font-semibold text-foreground">
                          {interview.application.job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('Candidate')}: {interview.application.candidate.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(interview.scheduledAt), 'PPP p')}
                        </div>
                      </div>
                      {interview.meetingLink && (
                        <Link href={interview.meetingLink} target="_blank">
                          <Button className="gap-2">
                            <Video className="w-4 h-4" />
                            {t('Join Interview')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-accent text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('Past Interviews')}
            </h2>
            {pastInterviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('No past interviews.')}</p>
            ) : (
              <div className="space-y-4">
                {pastInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-accent text-lg font-semibold text-foreground">
                          {interview.application.job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('Candidate')}: {interview.application.candidate.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(interview.scheduledAt), 'PPP p')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {interview.meetingLink && (
                          <>
                            <Link href={interview.meetingLink} target="_blank">
                              <Button variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" />
                                {t('View MoM')}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => window.open(`/api/meetings/${interview.id}/mom/download`, '_blank')}
                            >
                              <FileText className="w-4 h-4" />
                              {t('Download')}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
