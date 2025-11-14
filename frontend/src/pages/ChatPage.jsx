import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./ChatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user) return;

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages`);
            const data = await res.json();

            setMessages(
                data.map(m => ({
                    text: m.text,
                    senderId: m.sender_id,
                    sent: m.sender_id === user.id
                }))
            );
        };

        fetchMessages();

        socket.on("receive_message", (msg) => {
            setMessages(prev => [
                ...prev,
                { ...msg, sent: msg.senderId === user.id }
            ]);
        });

        return () => socket.off("receive_message");
    }, [user]);

    const handleSend = () => {
        if (!input.trim() || !user) return;

        socket.emit("send_message", {
            text: input,
            senderId: user.id
        });

        setInput("");
    };

    return (
        <div className="chat-container">
            <div className="sidebar">
                <h2>ChatApp</h2>
                <div className="chat-list">
                    {["Group Chat 1", "Group Chat 2", "John Doe", "Jane Smith"].map((name, i) => (
                        <div key={i} className="chat-item">
                            <img src="https://dummyimage.com/40x40/000/fff" alt="user" />
                            <span>{name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-area">
                <div className="chat-header">
                    <h3>Group Chat 1</h3>
                    <div className="actions">
                        <button title="Emoji">😊</button>
                        <button title="Attach File">📎</button>
                        <button title="Voice Call">🎤</button>
                        <button title="Video Call">📹</button>
                    </div>
                </div>

                <div className="messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.sent ? "sent" : ""}`}>
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
                    <button onClick={handleSend}>➡️</button>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;


