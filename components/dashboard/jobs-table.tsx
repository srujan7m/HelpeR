'use client'

import { MoreHorizontal, Loader2, Trash2, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Job {
  id: string
  title: string
  createdAt: string
  _count: {
    applications: number
  }
}

export function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const result = await response.json()
      if (result.success) {
        setJobs(result.data)
      } else {
        toast.error(result.error || 'Failed to fetch jobs')
      }
    } catch (error) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        toast.success('Job deleted')
        setJobs(jobs.filter(job => job.id !== id))
      } else {
        toast.error(result.error || 'Failed to delete job')
      }
    } catch (error) {
      toast.error('Failed to delete job')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border border-border rounded-2xl bg-card">
        No jobs found. Create your first job to get started.
      </div>
    )
  }

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
                  {format(new Date(job.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {job._count.applications}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`)
                          toast.success('Application link copied to clipboard')
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
