import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            createdBy: {
                select: { name: true }
            }
        }
    })

    if (!job) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-accent text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        HelpeR
                    </Link>
                    <Link href="/sign-in">
                        <Button variant="ghost" size="sm">Recruiter Login</Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border pb-8">
                        <div>
                            <h1 className="font-accent text-3xl font-bold text-foreground mb-2">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                                <span className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    Full-time
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    Remote
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                    By {job.createdBy.name}
                                </span>
                            </div>
                        </div>
                        <Link href={`/jobs/${job.id}/apply`}>
                            <Button size="lg" className="w-full md:w-auto">
                                Apply Now
                            </Button>
                        </Link>
                    </div>

                    <div className="prose prose-stone dark:prose-invert max-w-none">
                        <h3 className="text-lg font-semibold mb-4">About the Role</h3>
                        <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {job.description}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
