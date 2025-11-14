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

io.on("connection", (socket) => {
    console.log("User connected", socket.id);


    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on("send_message", async (data) => {
        const { text, senderId, receiverId } = data;


        const message = await Message.create({
            text,
            senderId,
            receiverId,
        });


        io.to(receiverId).emit("receive_message", message);


        io.to(senderId).emit("receive_message", message);
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

