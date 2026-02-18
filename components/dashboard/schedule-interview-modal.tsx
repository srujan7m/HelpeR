'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { startOfTomorrow, format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ScheduleInterviewModalProps {
    isOpen: boolean
    onClose: () => void
    applicationId: string
    candidateName: string
    jobTitle: string
    candidateEmail: string
    onScheduled: () => void
}

export function ScheduleInterviewModal({
    isOpen,
    onClose,
    applicationId,
    candidateName,
    jobTitle,
    candidateEmail,
    onScheduled,
}: ScheduleInterviewModalProps) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSchedule = async () => {
        if (!date || !time) {
            toast.error('Please select both date and time')
            return
        }

        setLoading(true)
        try {
            const scheduledAt = new Date(`${date}T${time}`)

            const response = await fetch('/api/interviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationId,
                    candidateName,
                    candidateEmail,
                    jobTitle,
                    scheduledAt: scheduledAt.toISOString(),
                }),
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Interview scheduled successfully')
                onScheduled()
                onClose()
            } else {
                throw new Error(result.error || 'Failed to schedule interview')
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        Schedule an interview with {candidateName} for {jobTitle}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="date" className="text-sm font-medium">
                            Date
                        </label>
                        <input
                            id="date"
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            min={format(startOfTomorrow(), 'yyyy-MM-dd')}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="time" className="text-sm font-medium">
                            Time
                        </label>
                        <input
                            id="time"
                            type="time"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSchedule} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Scheduling...
                            </>
                        ) : (
                            'Schedule Interview'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
