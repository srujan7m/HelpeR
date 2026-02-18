import { z } from 'zod'

export const createJobSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    preferredLanguage: z.string().default('en'),
})

export const createApplicationSchema = z.object({
    jobId: z.string().cuid(),
    resumeFile: z.instanceof(File).refine(
        (file) => file.type === 'application/pdf',
        'Only PDF files are allowed'
    ).refine(
        (file) => file.size <= 10 * 1024 * 1024,
        'File size must be less than 10MB'
    ),
})

export const updateApplicationStatusSchema = z.object({
    status: z.enum(['APPLIED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW']),
})

export const screenResumeSchema = z.object({
    applicationId: z.string().cuid(),
    keywords: z.array(z.string()).optional(),
})

export const scheduleInterviewSchema = z.object({
    applicationId: z.string().cuid(),
    scheduledAt: z.string().datetime(),
    candidateEmail: z.string().email(),
    candidateName: z.string(),
    jobTitle: z.string(),
})

export const uploadTranscriptSchema = z.object({
    transcript: z.string().min(10, 'Transcript must be at least 10 characters'),
})

export const generateMomSchema = z.object({
    interviewId: z.string().cuid(),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>
export type ScreenResumeInput = z.infer<typeof screenResumeSchema>
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>
export type UploadTranscriptInput = z.infer<typeof uploadTranscriptSchema>
export type GenerateMomInput = z.infer<typeof generateMomSchema>
