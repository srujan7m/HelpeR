'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScreeningModalProps {
    isOpen: boolean
    onClose: () => void
    onScreen: (keywords: string[]) => Promise<void>
    isScreening: boolean
}

export function ScreeningModal({
    isOpen,
    onClose,
    onScreen,
    isScreening,
}: ScreeningModalProps) {
    const [input, setInput] = useState('')
    const [keywords, setKeywords] = useState<string[]>([])

    if (!isOpen) return null

    const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault()
            if (!keywords.includes(input.trim())) {
                setKeywords([...keywords, input.trim()])
            }
            setInput('')
        }
    }

    const removeKeyword = (keywordToRemove: string) => {
        setKeywords(keywords.filter((k) => k !== keywordToRemove))
    }

    const handleSubmit = () => {
        // Add current input if not empty
        const finalKeywords = input.trim() ? [...keywords, input.trim()] : keywords
        onScreen(finalKeywords)
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl border border-border shadow-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-accent text-xl font-bold text-foreground">
                        Screen Resume
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Keywords (Optional)
                        </label>
                        <p className="text-xs text-muted-foreground mb-3">
                            Enter specific skills or qualifications to check for (Press Enter to add).
                        </p>

                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleAddKeyword}
                                placeholder="e.g. React, Node.js, Leadership"
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                disabled={isScreening}
                            />
                        </div>

                        {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {keywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                                    >
                                        {keyword}
                                        <button
                                            onClick={() => removeKeyword(keyword)}
                                            className="hover:text-destructive transition-colors"
                                            disabled={isScreening}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isScreening}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 gap-2"
                            disabled={isScreening}
                        >
                            {isScreening ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Screening...
                                </>
                            ) : (
                                'Start Screening'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
