import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (meetingId: string, userId: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        const socketInstance = io(socketUrl);

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket server');

            if (meetingId && userId) {
                socketInstance.emit('join-room', { meetingId, userId });
            }
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from socket server');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [meetingId, userId]);

    return { socket, isConnected };
};
