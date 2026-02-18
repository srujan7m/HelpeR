import { z } from 'zod'
import { Role, ApplicationStatus } from '@prisma/client'

// Job Schemas
export const createJobSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    preferredLanguage: z.string().default('en'),
})

export const updateJobSchema = createJobSchema.partial()

// Application Schemas
export const createApplicationSchema = z.object({
    jobId: z.string().cuid(),
    resumeUrl: z.string().url('Invalid resume URL'),
})

export const updateApplicationStatusSchema = z.object({
    status: z.nativeEnum(ApplicationStatus),
})

// Interview Schemas
export const scheduleInterviewSchema = z.object({
    applicationId: z.string().cuid(),
    scheduledAt: z.string().datetime(),
})

export const updateInterviewSchema = z.object({
    meetingLink: z.string().url().optional(),
    transcript: z.string().optional(),
})
