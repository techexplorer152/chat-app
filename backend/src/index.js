import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import groupRoutes from "./routes/group.routes.js";
import setupChatSockets from "./sockets/chat.socket.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                origin.startsWith("http://10.") ||
                origin.startsWith("http://172.") ||
                origin.startsWith("http://192.") ||
                origin.startsWith("http://localhost") ||
                origin.startsWith("http://127.0.0.1")
            ) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

app.get("/", (req, res) => {
    res.send("Server is running");
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
        methods: ["GET", "POST"],
    },
});

setupChatSockets(io);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server active on port ${PORT}`);
});
