import { useState, useRef, useCallback } from 'react';

export const useMediaRecorder = (
    onAudioChunk: (chunk: Blob) => void
) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    onAudioChunk(event.data);
                }
            };

            // Record in 3-second chunks
            recorder.start(3000);

            mediaRecorder.current = recorder;
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }, [onAudioChunk]);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, [isRecording]);

    return { isRecording, startRecording, stopRecording };
};
