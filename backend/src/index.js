import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.routes.js';
import { Server } from "socket.io";
import prisma from './db/connect.js';

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.VITE_FRONTEND_URL;

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("send_message", async ({ text, senderId }) => {
        if (!text || !senderId) return;

        const savedMessage = await prisma.messages.create({
            data: {
                text,
                sender_id: senderId,
            },
        });

        io.emit("receive_message", {
            id: savedMessage.id,
            text: savedMessage.text,
            senderId: savedMessage.sender_id,
            createdAt: savedMessage.created_at
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('This is a Test');
});

app.get("/api/messages", async (req, res) => {
    const allMessages = await prisma.messages.findMany({
        orderBy: { id: "asc" }
    });
    res.json(allMessages);
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
});

