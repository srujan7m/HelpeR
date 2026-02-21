'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema for client-side validation
const applicationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    resume: z.instanceof(FileList).refine(
        (files) => files.length === 1,
        'Resume is required'
    ).refine(
        (files) => {
            const selectedFile = files[0]
            if (!selectedFile) return false
            return (
                selectedFile.type === 'application/pdf' ||
                selectedFile.name.toLowerCase().endsWith('.pdf')
            )
        },
        'Only PDF files are allowed'
    ).refine(
        (files) => files[0]?.size <= 5 * 1024 * 1024,
        'File size must be less than 5MB'
    ),
})

type FormData = z.infer<typeof applicationSchema>

export default function ApplyPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(applicationSchema),
    })

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('jobId', id)
            formData.append('name', data.name)
            formData.append('email', data.email)
            formData.append('resume', data.resume[0])

            const response = await fetch('/api/public/applications', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Failed to submit application')
            }

            setIsSuccess(true)
            toast.success('Application submitted successfully!')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="font-accent text-2xl font-bold text-foreground mb-2">
                        Application Received!
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Thank you for applying. We have received your application and will review it shortly.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href={`/jobs/${id}`}>
                            <Button variant="outline" className="w-full">Return to Job Details</Button>
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" className="w-full">Back to Home</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/jobs/${id}`} className="font-accent text-lg font-semibold text-foreground flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Job
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-xl">
                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                    <h1 className="font-accent text-2xl font-bold text-foreground mb-2">
                        Apply for Position
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Please fill out the form below to submit your application.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Full Name
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="john@example.com"
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Resume (PDF)
                            </label>
                            <div className="border-2 border-dashed border-input rounded-xl p-6 text-center hover:bg-muted/30 transition-colors">
                                <input
                                    {...register('resume')}
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        Click to upload resume
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        PDF up to 5MB
                                    </span>
                                </label>
                            </div>
                            {errors.resume && (
                                <p className="text-sm text-destructive mt-1">{errors.resume.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Submitting Application...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}
