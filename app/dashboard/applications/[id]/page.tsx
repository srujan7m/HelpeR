'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, FileText, ScanSearch, Download, Calendar, Video, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'
import { ScreeningModal } from '@/components/dashboard/screening-modal'
import { ScheduleInterviewModal } from '@/components/dashboard/schedule-interview-modal'

interface Application {
    id: string
    status: string
    createdAt: string
    resumeUrl: string
    extractedText: string
    aiScore: any
    candidate: {
        name: string
        email: string
    }
    job: {
        title: string
        description: string
    }
    interview?: {
        id: string
        scheduledAt: string
        meetingLink: string
    }
}

export default function ApplicationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [application, setApplication] = useState<Application | null>(null)
    const [loading, setLoading] = useState(true)
    const [isScreeningModalOpen, setIsScreeningModalOpen] = useState(false)
    const [isScreening, setIsScreening] = useState(false)
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

    const fetchApplication = async () => {
        try {
            const response = await fetch(`/api/applications/${id}`)
            const result = await response.json()
            if (result.success) {
                setApplication(result.data)
            } else {
                toast.error(result.error || 'Failed to fetch application')
                router.push('/dashboard/applications')
            }
        } catch (error) {
            toast.error('Failed to load application')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchApplication()
    }, [id])

    const handleScreen = async (keywords: string[]) => {
        setIsScreening(true)
        try {
            const response = await fetch('/api/ai/screen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: id, keywords }),
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Resume screened successfully')
                setIsScreeningModalOpen(false)
                fetchApplication() // Refresh to show new score
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!application) return null

    return (
        <>
            <Header
                title="Application Details"
                description={`Review application for ${application.job.title}`}
            />

            <main className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/dashboard/applications">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Applications
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        {application.status !== 'INTERVIEW' && (
                            <Button onClick={() => setIsScheduleModalOpen(true)} className="gap-2">
                                <Calendar className="w-4 h-4" />
                                Shortlist & Schedule Interview
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Candidate & Job Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {application.interview && (
                            <Card className="border-primary/50 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-primary">
                                        <Calendar className="w-5 h-5" />
                                        Interview Scheduled
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Date & Time</div>
                                            <div className="text-lg font-semibold">
                                                {format(new Date(application.interview.scheduledAt), 'PPP p')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Meeting Link</div>
                                            <a
                                                href={application.interview.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline break-all"
                                            >
                                                {application.interview.meetingLink}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <Link href={application.interview.meetingLink} target="_blank">
                                            <Button className="gap-2">
                                                <Video className="w-4 h-4" />
                                                Join Meeting
                                            </Button>
                                        </Link>
                                        <Button variant="outline" className="gap-2" onClick={() => {
                                            navigator.clipboard.writeText(application.interview?.meetingLink || '')
                                            toast.success('Meeting link copied')
                                        }}>
                                            <Share2 className="w-4 h-4" />
                                            Copy Link
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Candidate Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Name</div>
                                        <div className="text-lg">{application.candidate.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                                        <div className="text-lg">{application.candidate.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Applied On</div>
                                        <div>{format(new Date(application.createdAt), 'PPP')}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Status</div>
                                        <div className="inline-flex px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                                            {application.status}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Resume Content</CardTitle>
                                <div className="flex gap-2">
                                    {application.resumeUrl && (
                                        <Link href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <FileText className="w-4 h-4" />
                                                View PDF
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto font-mono">
                                    {application.extractedText || "No text extracted from resume."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: AI Screening */}
                    <div className="space-y-6">
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    AI Screening
                                    <Button size="sm" onClick={() => setIsScreeningModalOpen(true)}>
                                        <ScanSearch className="w-4 h-4 mr-2" />
                                        {application.aiScore ? 'Re-Screen' : 'Screen Resume'}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {application.aiScore ? (
                                    <div className="space-y-6">
                                        <div className="flex flex-col items-center justify-center p-4">
                                            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-muted">
                                                <div
                                                    className={`absolute inset-0 rounded-full border-8 border-primary transition-all duration-1000`}
                                                    style={{
                                                        clipPath: `inset(0 0 ${100 - (application.aiScore.overallScore || 0)}% 0)`
                                                    }}
                                                />
                                                <span className="text-3xl font-bold">{application.aiScore.overallScore}%</span>
                                            </div>
                                            <span className="mt-2 text-sm text-muted-foreground">Overall Match</span>
                                        </div>

                                        <div className="space-y-3">
                                            <ScoreRow label="Technical Skills" score={application.aiScore.technicalSkills} />
                                            <ScoreRow label="Experience" score={application.aiScore.experience} />
                                            <ScoreRow label="Education" score={application.aiScore.education} />
                                            <ScoreRow label="Cultural Fit" score={application.aiScore.culturalFit} />
                                            {application.aiScore.keywordMatch !== undefined && (
                                                <ScoreRow label="Keyword Match" score={application.aiScore.keywordMatch} />
                                            )}
                                        </div>

                                        {application.aiScore.summary && (
                                            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                                                <span className="font-semibold block mb-1">Summary:</span>
                                                {application.aiScore.summary}
                                            </div>
                                        )}

                                        {application.aiScore.strengths && application.aiScore.strengths.length > 0 && (
                                            <div>
                                                <span className="font-semibold text-sm">Strengths:</span>
                                                <ul className="list-disc pl-4 text-sm text-muted-foreground mt-1">
                                                    {application.aiScore.strengths.map((s: string, i: number) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {application.aiScore.concerns && application.aiScore.concerns.length > 0 && (
                                            <div>
                                                <span className="font-semibold text-sm text-destructive">Concerns:</span>
                                                <ul className="list-disc pl-4 text-sm text-muted-foreground mt-1">
                                                    {application.aiScore.concerns.map((c: string, i: number) => (
                                                        <li key={i}>{c}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-border">
                                            <span className="font-semibold text-sm mr-2">Recommendation:</span>
                                            <span className={`font-bold ${getRecommendationColor(application.aiScore.recommendation)}`}>
                                                {application.aiScore.recommendation}
                                            </span>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ScanSearch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Resume has not been screened yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <ScreeningModal
                isOpen={isScreeningModalOpen}
                onClose={() => setIsScreeningModalOpen(false)}
                onScreen={handleScreen}
                isScreening={isScreening}
            />

            <ScheduleInterviewModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                applicationId={application.id}
                candidateName={application.candidate.name}
                candidateEmail={application.candidate.email}
                jobTitle={application.job.title}
                onScheduled={() => {
                    fetchApplication()
                }}
            />
        </>
    )
}

function ScoreRow({ label, score }: { label: string, score: number }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${score}%` }} />
                </div>
                <span className="font-medium w-8 text-right">{score}%</span>
            </div>
        </div>
    )
}

function getRecommendationColor(rec: string) {
    switch (rec) {
        case 'STRONG_YES': return 'text-green-600'
        case 'YES': return 'text-green-500'
        case 'MAYBE': return 'text-yellow-500'
        case 'NO': return 'text-orange-500'
        case 'STRONG_NO': return 'text-red-500'
        default: return 'text-foreground'
    }
}
