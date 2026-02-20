"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, PhoneOff, FileText, Play, Square } from "lucide-react";
import { toast } from "sonner";

interface Transcript {
    speakerId: string;
    text: string;
    timestamp: string;
}

interface MeetingRoomProps {
    meetingId: string;
    userId: string;
}

export default function MeetingRoom({ meetingId, userId }: MeetingRoomProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [mom, setMom] = useState<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [status, setStatus] = useState("Connecting...");

    useEffect(() => {
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to websocket", newSocket.id);
            setStatus("Connected");
            newSocket.emit("join-room", { meetingId, userId });
            toast.success("Connected to meeting room");
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            setStatus("Connection Error");
            toast.error("Failed to connect to server");
        });

        newSocket.on("new-transcript", (data: Transcript) => {
            console.log("Received transcript:", data);
            setTranscripts((prev) => [...prev, data]);
        });

        newSocket.on("mom-generated", (momData) => {
            console.log("MOM generated:", momData);
            setMom(momData);
            toast.success("MOM Generated!");
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
            setStatus("Disconnected");
            toast.error("Disconnected from meeting room");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [meetingId, userId]);

    const startRecording = async () => {
        if (!socket || !socket.connected) {
            toast.error("Socket not connected. Cannot start.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    const arrayBuffer = await event.data.arrayBuffer();
                    console.log("Sending audio chunk, size:", arrayBuffer.byteLength);
                    socket.emit("audio-chunk", {
                        meetingId,
                        userId,
                        audioChunk: arrayBuffer
                    });
                }
            };

            mediaRecorder.start(3000); // 3 second chunks
            setIsRecording(true);
            toast.info("Recording started");
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            toast.info("Recording stopped");
        }
    };

    const endMeeting = () => {
        if (!socket || !socket.connected) {
            toast.error("Socket not connected. Cannot end meeting.");
            return;
        }
        stopRecording();
        console.log("Ending meeting:", meetingId);
        socket.emit("end-meeting", { meetingId });
        toast.loading("Ending meeting and generating MOM...");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-[calc(100vh-100px)]">
            {/* Controls & Live Transcript */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span>Live Meeting</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {status}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {!isRecording ? (
                                <Button onClick={startRecording} variant="default" size="sm" disabled={status !== 'Connected'}>
                                    <Mic className="md:mr-2 h-4 w-4" />
                                    <span className="hidden md:inline">Start Audio</span>
                                </Button>
                            ) : (
                                <Button onClick={stopRecording} variant="secondary" size="sm" className="bg-red-100 hover:bg-red-200 text-red-700">
                                    <MicOff className="md:mr-2 h-4 w-4" />
                                    <span className="hidden md:inline">Mute Audio</span>
                                </Button>
                            )}

                            <Button onClick={endMeeting} variant="destructive" size="sm" disabled={status !== 'Connected'}>
                                <PhoneOff className="md:mr-2 h-4 w-4" />
                                <span className="hidden md:inline">End Meeting</span>
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <div className="text-sm text-muted-foreground mb-2">Live Transcripts</div>
                    <ScrollArea className="h-full w-full rounded-md border p-4">
                        {transcripts.length === 0 && <p className="text-center text-muted-foreground italic mt-10">No transcripts yet. Start speaking...</p>}
                        {transcripts.map((t, i) => (
                            <div key={i} className="mb-4">
                                <div className="font-semibold text-xs text-primary mb-1">{t.speakerId} <span className="text-muted-foreground font-normal ml-2">{new Date(t.timestamp).toLocaleTimeString()}</span></div>
                                <div className="text-sm bg-muted/50 p-2 rounded-md">{t.text}</div>
                            </div>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* MOM Display */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle>Minutes of Meeting</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    {!mom ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>MOM will be generated here after the meeting ends.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full w-full pr-4">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                                    <p className="text-sm leading-relaxed">{mom.summary}</p>
                                </div>

                                {mom.keyPoints?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-base mb-2 text-blue-600">Key Points</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            {mom.keyPoints.map((point: string, i: number) => (
                                                <li key={i}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {mom.actionItems?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-base mb-2 text-green-600">Action Items</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            {mom.actionItems.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {mom.decisions?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-base mb-2 text-purple-600">Decisions</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            {mom.decisions.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
