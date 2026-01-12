import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import LogoutButton from "../components/LogoutButton.jsx";
import "./ChatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(SOCKET_URL, {
    autoConnect: false,
});

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

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
        if ((!input.trim() && !image) || !user.id) return;

        try {
            const formData = new FormData();
            formData.append("text", input);
            formData.append("sender_id", user.id);
            if (image) {
                formData.append("image", image);
            }

            const res = await fetch(`${API_URL}/messages`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to send");

            const savedMessage = await res.json();

            socket.emit("send_message", savedMessage);

            setMessages((prev) => [
                ...prev,
                { ...savedMessage, sent: true },
            ]);

            setInput("");
            setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
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
                            {m.image_url && (
                                <img
                                    src={`${BACKEND_URL}${m.image_url}`}
                                    alt="upload"
                                    className="message-image"
                                />
                            )}
                            {m.text && <p>{m.text}</p>}
                        </div>
                    ))}
                </div>

                <div className="message-input">
                    <label htmlFor="file-upload" className="custom-file-upload">
                        📷
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => setImage(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
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