'use client'

import { Header } from '@/components/dashboard/header'
import { JobsTable } from '@/components/dashboard/jobs-table'
import { Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createJobSchema } from '@/lib/validators'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useUiTranslations } from '@/hooks/use-ui-translations'

type JobFormData = z.infer<typeof createJobSchema>

export default function JobsPage() {
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()
  const { t } = useUiTranslations(
    'Failed to create job',
    'Job created successfully',
    'Something went wrong',
    'Jobs',
    'Manage your job postings and applications',
    'Active Jobs',
    'Create Job',
    'Create New Job',
    'Job Title',
    'Description',
    'Preferred Language',
    'Cancel',
    'Creating...',
    'Create'
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      preferredLanguage: 'en',
    },
  })

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || t('Failed to create job'))
      }

      toast.success(t('Job created successfully'))
      setIsCreatingJob(false)
      reset()
      setRefreshKey((prev) => prev + 1)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Something went wrong'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header
        title="Jobs"
        description="Manage your job postings and applications"
      />
      <main className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-accent text-xl font-semibold text-foreground">
            {t('Active Jobs')}
          </h2>
          <button
            onClick={() => setIsCreatingJob(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-5 h-5" />
            {t('Create Job')}
          </button>
        </div>

        <JobsTable key={refreshKey} />

        {isCreatingJob && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border shadow-lg max-w-md w-full p-8">
              <h3 className="font-accent text-2xl font-bold text-foreground mb-6">
                {t('Create New Job')}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('Job Title')}
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="Senior Software Engineer"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('Description')}
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder="Job description and requirements..."
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('Preferred Language')}
                  </label>
                  <select
                    {...register('preferredLanguage')}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatingJob(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-input text-foreground hover:bg-secondary transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('Creating...')}
                      </>
                    ) : (
                      t('Create')
                    )}
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
