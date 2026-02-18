export interface AIScoreResult {
    overallScore: number
    technicalSkills: number
    experience: number
    education: number
    culturalFit: number
    summary: string
    strengths: string[]
    concerns: string[]
    recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO'
}

export interface MoMResult {
    summary: string
    keyPoints: string[]
    technicalDiscussion: string[]
    candidateStrengths: string[]
    candidateWeaknesses: string[]
    interviewerNotes: string[]
    recommendation: string
    nextSteps: string[]
}

export interface ApiResponse<T = any> {
    success: true
    data: T
    message?: string
}

export interface ApiError {
    success: false
    error: string
    details?: any
}

export type ApiResult<T = any> = ApiResponse<T> | ApiError
