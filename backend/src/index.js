import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import os from 'os';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import setupChatSockets from './sockets/chat.socket.js';

const app = express();
const PORT = process.env.PORT || 5000;

const getNetworkIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

const currentIP = getNetworkIP();

const allowedOrigins = [
    `http://${currentIP}:5173`,
    `http://localhost:5173`,
    "http://127.0.0.1:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send(`Server is running at ${currentIP}`);
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

setupChatSockets(io);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server active on:`);
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://${currentIP}:${PORT}`);
});