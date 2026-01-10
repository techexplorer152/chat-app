
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LogoutButton from "../components/LogoutButton.jsx";
import "./ChatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(SOCKET_URL, {
    autoConnect: false,
});

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (!user.id) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/messages`);
                const data = await res.json();
                setMessages(
                    data.map((m) => ({
                        ...m,
                        sent: Number(m.sender_id) === Number(user.id),
                    }))
                );
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };

        fetchMessages();
    }, [user.id]);

    useEffect(() => {
        if (!user.id) return;

        socket.connect();

        socket.on("receive_message", (msg) => {
            setMessages((prev) => [
                ...prev,
                { ...msg, sent: Number(msg.sender_id) === Number(user.id) },
            ]);
        });

        return () => {
            socket.off("receive_message");
            socket.disconnect();
        };
    }, [user.id]);

    const handleSend = async () => {
        if (!input.trim() || !user.id) return;

        try {
            const res = await fetch(`${API_URL}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: input,
                    sender_id: user.id,
                }),
            });

            if (!res.ok) throw new Error("Failed to send");

            const savedMessage = await res.json();

            socket.emit("send_message", savedMessage);

            setMessages((prev) => [
                ...prev,
                { ...savedMessage, sent: true },
            ]);

            setInput("");
        } catch (err) {
            console.error("Send error:", err);
        }
    };

    return (
        <div className="chat-container">
            <div className="sidebar">
                <h2>ChatApp</h2>
                <div className="chat-list">
                    <div className="chat-item">
                        <span># General Group</span>
                    </div>
                </div>
                <LogoutButton />
            </div>

            <div className="chat-area">
                <div className="chat-header">
                    <h3>Group Chat</h3>
                </div>

                <div className="messages">
                    {messages.map((m, i) => (
                        <div key={m.id || i} className={`message ${m.sent ? "sent" : ""}`}>
                            {m.text}
                        </div>
                    ))}
                </div>

                <div className="message-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button onClick={handleSend} type="button">➡️</button>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;