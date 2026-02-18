import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (meetingId: string, userId: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to backend server
        const socketInstance = io('http://localhost:3001');

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket server');

            // Join the meeting room
            socketInstance.emit('join-room', { meetingId, userId });
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
