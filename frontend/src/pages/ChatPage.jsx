import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LogoutButton from '../components/LogoutButton.jsx';
import "./ChatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(SOCKET_URL);

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/messages`);
                const data = await res.json();
                setMessages(
                    data.map((m) => ({
                        ...m,
                        sent: m.sender_id === user.id
                    }))
                );
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };
        if (user) fetchMessages();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        socket.connect();

        socket.on("receive_message", (msg) => {
            setMessages((prev) => [
                ...prev,
                { ...msg, sent: msg.sender_id === user.id }
            ]);
        });

        return () => {
            socket.off("receive_message");
            socket.disconnect();
        };
    }, [user]);

    const handleSend = () => {
        if (!input.trim() || !user) return;

        const messageData = {
            text: input,
            senderId: user.id
        };

        setMessages((prev) => [...prev, { ...messageData, sent: true }]);
        socket.emit("send_message", messageData);
        setInput("");
    };

    return (
        <div className="chat-container">
            <div className="sidebar">
                <h2>ChatApp</h2>
                <LogoutButton/>
            </div>
            <div className="chat-area">
                <div className="chat-header">
                    <h3>Group Chat</h3>

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

