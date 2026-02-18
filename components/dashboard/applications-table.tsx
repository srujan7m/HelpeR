'use client'

import { MoreHorizontal, Loader2, ScanSearch } from 'lucide-react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScreeningModal } from './screening-modal'
import Link from 'next/link'

interface Application {
  id: string
  status: string
  createdAt: string
  aiScore: any
  candidate: {
    name: string | null
    email: string
  }
  job: {
    title: string
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'SHORTLISTED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'INTERVIEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    case 'APPLIED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [isScreeningModalOpen, setIsScreeningModalOpen] = useState(false)
  const [isScreening, setIsScreening] = useState(false)

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const result = await response.json()
      if (result.success) {
        setApplications(result.data)
      } else {
        toast.error(result.error || 'Failed to fetch applications')
      }
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleOpenScreenModal = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAppId(appId)
    setIsScreeningModalOpen(true)
  }

  const handleScreen = async (keywords: string[]) => {
    if (!selectedAppId) return

    setIsScreening(true)
    try {
      const response = await fetch('/api/ai/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: selectedAppId, keywords }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Resume screened successfully')
        setIsScreeningModalOpen(false)
        fetchApplications() // Refresh list to show new score
      } else {
        throw new Error(result.error || 'Screening failed')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Screening failed')
    } finally {
      setIsScreening(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border border-border rounded-2xl bg-card">
        No applications found.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Candidate Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Job Title
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
                    {app.candidate.name || app.candidate.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {app.job.title}
                  </td>
                  <td className="px-6 py-4">
                    {app.aiScore ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-xs w-24">
                          <div
                            className={`h-2 rounded-full ${app.aiScore.overallScore >= 70
                              ? 'bg-green-500'
                              : app.aiScore.overallScore >= 40
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              }`}
                            style={{ width: `${app.aiScore.overallScore || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {app.aiScore.overallScore || 0}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not Screened</span>
                    )}
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
                    {format(new Date(app.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={(e) => handleOpenScreenModal(app.id, e)}
                      >
                        <ScanSearch className="w-3.5 h-3.5" />
                        Screen
                      </Button>
                      <Link href={`/dashboard/applications/${app.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1"
                        >
                          View
                        </Button>
                      </Link>
                      <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreeningModal
        isOpen={isScreeningModalOpen}
        onClose={() => setIsScreeningModalOpen(false)}
        onScreen={handleScreen}
        isScreening={isScreening}
      />
    </>
  )
}
