'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Calendar, Video, Clock } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Meeting {
    id: string
    title: string
    status: string
    createdAt: string
    endedAt: string | null
    type: string
}

export default function MeetingsPage() {
    const router = useRouter()
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)

    const fetchMeetings = async () => {
        try {
            // Reusing interviews API for now as it returns meetings related to user?
            // Actually I need a general meetings API.
            // Let's assume /api/meetings endpoint exists for listing all meetings by user.
            const response = await fetch('/api/meetings')
            const result = await response.json()
            if (result.success) {
                setMeetings(result.data)
            }
        } catch (error) {
            toast.error('Failed to load meetings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeetings()
    }, [])

    const handleCreateInstantMeeting = async () => {
        setCreating(true)
        try {
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Instant Meeting',
                    type: 'INSTANT'
                })
            })
            const result = await response.json()
            if (result.success) {
                router.push(`/meeting/${result.data.id}`)
            } else {
                throw new Error(result.error || 'Failed to create meeting')
            }
        } catch (error) {
            toast.error('Failed to create instant meeting')
        } finally {
            setCreating(false)
        }
    }

    return (
        <>
            <Header
                title="Meetings"
                description="Manage your scheduled interviews and instant meetings."
            />

            <main className="p-6 md:p-8 space-y-6">
                <div className="flex justify-end">
                    <Button onClick={handleCreateInstantMeeting} disabled={creating} size="lg" className="gap-2">
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                        Create Instant Meeting
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-border rounded-xl bg-card/50">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No meetings found</h3>
                        <p className="text-muted-foreground mb-6">
                            You haven't scheduled any meetings yet.
                        </p>
                        <Button onClick={handleCreateInstantMeeting} variant="outline">Create Instant Meeting</Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {meetings.map((meeting) => (
                            <Card key={meeting.id} className="hover:border-primary/50 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Video className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${meeting.status === 'LIVE' ? 'bg-red-100 text-red-700 animate-pulse' :
                                            meeting.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {meeting.status}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="font-semibold text-lg mb-2">{meeting.title}</h3>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(meeting.createdAt), 'MMM d, yyyy h:mm a')}
                                    </div>
                                    <Link href={`/meeting/${meeting.id}`}>
                                        <Button className="w-full" variant={meeting.status === 'COMPLETED' ? 'outline' : 'default'}>
                                            {meeting.status === 'COMPLETED' ? 'View Details' : 'Join Meeting'}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </>
    )
}
