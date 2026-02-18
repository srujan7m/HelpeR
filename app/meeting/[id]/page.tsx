'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/use-socket'
import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { TranscriptionFeed } from '@/components/meeting/transcription-feed'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, PhoneOff, Loader2, FileText, Share2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'

interface TranscriptItem {
    speakerId: string
    text: string
    timestamp: Date
}

export default function MeetingPage() {
    const params = useParams()
    const meetingId = params.id as string
    const { user, isLoaded } = useUser()
    const router = useRouter()

    const [meeting, setMeeting] = useState<any>(null)
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([])
    const [mom, setMom] = useState<any>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [loading, setLoading] = useState(true)

    const { socket, isConnected } = useSocket(meetingId, user?.id || '')

    // Fetch meeting details
    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const res = await fetch(`/api/meetings/${meetingId}`)
                const data = await res.json()
                if (data.success) {
                    setMeeting(data.data)
                    // If MOM exists, set it
                    if (data.data.mom) {
                        setMom({
                            summary: data.data.mom.summary,
                            keyPoints: data.data.mom.keyPoints,
                            actionItems: data.data.mom.actionItems
                        })
                    }
                }
            } catch (error) {
                console.error('Failed to fetch meeting:', error)
                toast.error('Failed to load meeting details')
            } finally {
                setLoading(false)
            }
        }
        if (meetingId) fetchMeeting()
    }, [meetingId])

    const { isRecording, startRecording, stopRecording } = useMediaRecorder((chunk) => {
        if (socket && isConnected && !isMuted) {
            socket.emit('audio-chunk', {
                meetingId,
                userId: user?.id,
                audioChunk: chunk
            })
        }
    })

    useEffect(() => {
        if (!socket) return

        socket.on('new-transcript', (data: any) => {
            setTranscripts(prev => [...prev, data])
        })

        socket.on('mom-generated', (data: any) => {
            setMom(data)
            toast.success('MOM Generated Successfully!')
        })

        socket.on('meeting-ended', () => {
            stopRecording()
            toast.info('Meeting has ended')
        })

        return () => {
            socket.off('new-transcript')
            socket.off('mom-generated')
            socket.off('meeting-ended')
        }
    }, [socket, stopRecording])

    useEffect(() => {
        // Start recording automatically when joined
        if (isConnected && !isRecording) {
            startRecording()
        }
    }, [isConnected, isRecording, startRecording])

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    const handleEndMeeting = () => {
        if (socket && meeting?.isHost) {
            socket.emit('end-meeting', { meetingId })
        }
    }

    const copyInviteLink = () => {
        const link = window.location.href
        navigator.clipboard.writeText(link)
        toast.success('Meeting link copied to clipboard')
    }

    if (!isLoaded || !user || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <Header
                title={meeting?.title || "Live Meeting"}
                description={
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">ID: {meetingId}</span>
                        {meeting?.isHost && (
                            <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={copyInviteLink}>
                                <Share2 className="h-3 w-3" />
                                Copy Link
                            </Button>
                        )}
                    </div>
                }
            />

            <main className="p-6 h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: Transcripts */}
                <div className="md:col-span-2 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium">
                                {isConnected ? 'Live' : 'Connecting...'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={isMuted ? "destructive" : "secondary"}
                                size="icon"
                                onClick={toggleMute}
                                className="rounded-full"
                            >
                                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>

                            {meeting?.isHost && (
                                <Button
                                    variant="destructive"
                                    onClick={handleEndMeeting}
                                    className="gap-2 rounded-full"
                                >
                                    <PhoneOff className="h-4 w-4" />
                                    End Meeting
                                </Button>
                            )}
                        </div>
                    </div>

                    <TranscriptionFeed transcripts={transcripts} currentUserId={user.id} />
                </div>

                {/* Right Panel: MOM Preview */}
                <div className="md:col-span-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Minutes of Meeting
                        </h3>
                        {mom && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => window.open(`/api/meetings/${meetingId}/mom/download`, '_blank')}>
                                <FileText className="h-3 w-3 mr-1" />
                                Download PDF
                            </Button>
                        )}
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {mom ? (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-primary mb-2">Summary</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {mom.summary}
                                    </p>
                                </div>
                                {mom.keyPoints && (
                                    <div>
                                        <h4 className="font-medium text-primary mb-2">Key Points</h4>
                                        <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                            {mom.keyPoints.map((point: string, i: number) => (
                                                <li key={i}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {mom.actionItems && (
                                    <div>
                                        <h4 className="font-medium text-primary mb-2">Action Items</h4>
                                        <ul className="list-check pl-4 text-sm text-muted-foreground space-y-1">
                                            {mom.actionItems.map((item: string, i: number) => (
                                                <li key={i}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <FileText className="h-12 w-12 text-muted-foreground/20 mb-4" />
                                <h4 className="font-medium text-muted-foreground">No MOM Generated Yet</h4>
                                <p className="text-xs text-muted-foreground/60 mt-2">
                                    {meeting?.isHost
                                        ? "End the meeting to generate Minutes of Meeting using AI."
                                        : "Waiting for host to end meeting and generate MOM."
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}
