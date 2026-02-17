'use client'

import { Header } from '@/components/dashboard/header'
import { JobsTable } from '@/components/dashboard/jobs-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function JobsPage() {
  const [isCreatingJob, setIsCreatingJob] = useState(false)

  return (
    <>
      <Header
        title="Jobs"
        description="Manage your job postings and applications"
      />
      <main className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-accent text-xl font-semibold text-foreground">
            Active Jobs
          </h2>
          <button
            onClick={() => setIsCreatingJob(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Job
          </button>
        </div>

        {/* Jobs Table */}
        <JobsTable />

        {/* Create Job Modal */}
        {isCreatingJob && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border shadow-lg max-w-md w-full p-8">
              <h3 className="font-accent text-2xl font-bold text-foreground mb-6">
                Create New Job
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="Senior Software Engineer"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Job description and requirements..."
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preferred Language
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatingJob(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-input text-foreground hover:bg-secondary transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
