"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const meeting_socket_1 = require("./socket/meeting.socket");
dotenv_1.default.config({ path: '../.env' }); // Load .env from root
console.log("Environment variables loaded:", Object.keys(process.env).length);
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" })); // Allow all origins
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
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
(0, meeting_socket_1.setupMeetingSocket)(io);
const PORT = 5000;
httpServer.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
