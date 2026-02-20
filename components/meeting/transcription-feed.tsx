'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface TranscriptItem {
    speakerId: string
    speakerName?: string
    text: string
    timestamp: Date | string
}

interface TranscriptionFeedProps {
    transcripts: TranscriptItem[]
    currentUserId: string
}

export function TranscriptionFeed({ transcripts, currentUserId }: TranscriptionFeedProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [transcripts])

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcripts.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    <p>Waiting for speech...</p>
                </div>
            ) : (
                transcripts.map((item, index) => {
                    const isMe = item.speakerId === currentUserId
                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex w-full mb-4",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-3",
                                    isMe
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-muted text-foreground rounded-bl-none"
                                )}
                            >
                                {!isMe && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-5 w-5 rounded-full bg-background/20 flex items-center justify-center">
                                            <User className="h-3 w-3" />
                                        </div>
                                        <span className="text-xs font-medium opacity-70">
                                            {item.speakerName || `Speaker ${item.speakerId.slice(0, 4)}`}
                                        </span>
                                        <span className="text-xs opacity-50">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                )}
                                {isMe && (
                                    <div className="text-right text-xs opacity-70 mb-1">
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed">{item.text}</p>
                            </div>
                        </div>
                    )
                })
            )}
            <div ref={bottomRef} />
        </div>
    )
}
