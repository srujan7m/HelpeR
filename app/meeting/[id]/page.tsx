'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSocket } from '@/hooks/use-socket'
import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { TranscriptionFeed } from '@/components/meeting/transcription-feed'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, PhoneOff, Loader2, FileText, Share2, User } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'

interface TranscriptItem {
    speakerId: string
    speakerName?: string
    text: string
    timestamp: Date | string
}

interface ParticipantItem {
    id: string
    clerkId: string
    name: string
}

export default function MeetingPage() {
    const params = useParams()
    const meetingId = params.id as string
    const { user, isLoaded } = useUser()

    const [meeting, setMeeting] = useState<any>(null)
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([])
    const [participants, setParticipants] = useState<ParticipantItem[]>([])
    const [mom, setMom] = useState<any>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [loading, setLoading] = useState(true)

    const localVideoRef = useRef<HTMLVideoElement | null>(null)
    const localStreamRef = useRef<MediaStream | null>(null)

    const { socket, isConnected } = useSocket(meetingId, user?.id || '')

    const normalizeMom = (data: any) => {
        if (!data) return null
        return {
            summary: data.summary || 'No summary available.',
            keyPoints: data.keyPoints || data.key_points || [],
            actionItems: data.actionItems || data.action_items || [],
            decisions: data.decisions || []
        }
    }

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const res = await fetch(`/api/meetings/${meetingId}`)
                const data = await res.json()
                if (data.success) {
                    setMeeting(data.data)
                    setParticipants(data.data.participants || [])
                    setTranscripts(data.data.transcripts || [])
                    if (data.data.mom) {
                        setMom(normalizeMom(data.data.mom))
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

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                localStreamRef.current = stream
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }
            } catch {
                toast.error('Camera access denied. Facecam card disabled for your stream.')
            }
        }

        startCamera()

        return () => {
            localStreamRef.current?.getTracks().forEach((track) => track.stop())
            localStreamRef.current = null
        }
    }, [])

    const { isRecording, startRecording, stopRecording } = useMediaRecorder((chunk) => {
        if (socket && isConnected && !isMuted) {
            socket.emit('audio-chunk', {
                meetingId,
                userId: user?.id,
                audioChunk: chunk,
                audioMimeType: chunk.type || 'audio/webm'
            })
        }
    })

    useEffect(() => {
        if (!socket) return

        socket.on('new-transcript', (data: TranscriptItem) => {
            setTranscripts((prev) => [...prev, data])
        })

        socket.on('mom-generated', (data: any) => {
            setMom(normalizeMom(data))
            toast.success('MOM generated successfully')
        })

        socket.on('participants-updated', (data: ParticipantItem[]) => {
            setParticipants(data)
        })

        socket.on('participant-joined', (data: ParticipantItem) => {
            setParticipants((prev) => {
                if (prev.some((participant) => participant.id === data.id)) return prev
                return [...prev, data]
            })
        })

        socket.on('meeting-ended', () => {
            stopRecording()
            toast.info('Meeting has ended')
        })

        socket.on('meeting-error', (data: { message?: string }) => {
            toast.error(data?.message || 'Meeting error')
        })

        return () => {
            socket.off('new-transcript')
            socket.off('mom-generated')
            socket.off('participants-updated')
            socket.off('participant-joined')
            socket.off('meeting-ended')
            socket.off('meeting-error')
        }
    }, [socket, stopRecording])

    useEffect(() => {
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
        navigator.clipboard.writeText(window.location.href)
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
                title={meeting?.title || 'Live Meeting'}
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
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((participant) => {
                        const isCurrentUser = participant.clerkId === user.id
                        return (
                            <Card key={participant.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="aspect-video bg-black relative">
                                        {isCurrentUser ? (
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-white/80">
                                                <User className="h-10 w-10" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            {participant.name}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="md:col-span-2 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium">{isConnected ? 'Live' : 'Connecting...'}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={isMuted ? 'destructive' : 'secondary'}
                                size="icon"
                                onClick={toggleMute}
                                className="rounded-full"
                            >
                                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>

                            {meeting?.isHost && (
                                <Button variant="destructive" onClick={handleEndMeeting} className="gap-2 rounded-full">
                                    <PhoneOff className="h-4 w-4" />
                                    End Meeting
                                </Button>
                            )}
                        </div>
                    </div>

                    <TranscriptionFeed transcripts={transcripts} currentUserId={user.id} />
                </div>

                <div className="md:col-span-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Minutes of Meeting
                        </h3>
                        {mom && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => window.open(`/api/meetings/${meetingId}/mom/download`, '_blank')}
                            >
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
                                    <p className="text-sm text-muted-foreground leading-relaxed">{mom.summary}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primary mb-2">Key Points</h4>
                                    <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                        {mom.keyPoints.map((point: string, i: number) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primary mb-2">Action Items</h4>
                                    <ul className="pl-4 text-sm text-muted-foreground space-y-1">
                                        {mom.actionItems.map((item: string, i: number) => (
                                            <li key={i}>- {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <FileText className="h-12 w-12 text-muted-foreground/20 mb-4" />
                                <h4 className="font-medium text-muted-foreground">No MOM Generated Yet</h4>
                                <p className="text-xs text-muted-foreground/60 mt-2">
                                    {meeting?.isHost
                                        ? 'End the meeting to generate Minutes of Meeting using AI.'
                                        : 'Waiting for host to end meeting and generate MOM.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}
