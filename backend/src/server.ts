import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupMeetingSocket } from './socket/meeting.socket';

dotenv.config({ path: '../.env' }); // Load .env from root

console.log("Environment variables loaded:", Object.keys(process.env).length);
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

const app = express();
app.use(cors({ origin: "*" })); // Allow all origins
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Setup Socket
setupMeetingSocket(io);

const PORT = 5000;

httpServer.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
