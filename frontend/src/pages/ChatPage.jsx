import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import LogoutButton from "../components/LogoutButton.jsx";
import "./ChatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(SOCKET_URL, { autoConnect: false });

function ChatPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API_URL}/users`);
                const data = await res.json();
                setUsers(data.filter(u => u.id !== user.id));
            } catch (err) { console.error("Users fetch error:", err); }
        };
        fetchUsers();
    }, [user.id]);

    useEffect(() => {
        if (!user.id || !selectedUser) return;
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/messages?user1=${user.id}&user2=${selectedUser.id}`);
                const data = await res.json();
                setMessages(data.map((m) => ({
                    ...m,
                    sent: Number(m.sender_id) === Number(user.id),
                })));
            } catch (err) { console.error("Fetch error:", err); }
        };
        fetchMessages();
    }, [user.id, selectedUser]);

    useEffect(() => {
        if (!user.id) return;
        socket.connect();

        socket.on("receive_message", (msg) => {
            if (
                (Number(msg.sender_id) === Number(selectedUser?.id) && Number(msg.receiver_id) === Number(user.id)) ||
                (Number(msg.sender_id) === Number(user.id) && Number(msg.receiver_id) === Number(selectedUser?.id))
            ) {
                setMessages((prev) => [...prev, { ...msg, sent: Number(msg.sender_id) === Number(user.id) }]);
            }
        });

        socket.on("message_deleted", (deletedId) => {
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        });

        return () => {
            socket.off("receive_message");
            socket.off("message_deleted");
            socket.disconnect();
        };
    }, [user.id, selectedUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (messageId) => {
        try {
            const res = await fetch(`${API_URL}/messages/${messageId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                socket.emit("delete_message", messageId);
                setMessages((prev) => prev.filter((m) => m.id !== messageId));
            }
        } catch (err) { console.error("Delete error:", err); }
    };

    const handleSend = async () => {
        if ((!input.trim() && !image) || !user.id || !selectedUser) return;
        try {
            const formData = new FormData();
            formData.append("text", input);
            formData.append("sender_id", user.id);
            formData.append("receiver_id", selectedUser.id);
            if (image) formData.append("image", image);

            const res = await fetch(`${API_URL}/messages`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to send");
            const savedMessage = await res.json();

            socket.emit("send_message", savedMessage);
            setMessages((prev) => [...prev, { ...savedMessage, sent: true }]);

            setInput("");
            setImage(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) { console.error("Send error:", err); }
    };

    return (
        <div className="chat-container">
            <div className="sidebar">
                <h2>ChatApp</h2>
                <div className="chat-list">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            className={`chat-item ${selectedUser?.id === u.id ? "active" : ""}`}
                            onClick={() => setSelectedUser(u)}
                        >
                            <span>{u.username}</span>
                        </div>
                    ))}
                </div>
                <LogoutButton />
            </div>

            <div className="chat-area">
                <div className="chat-header">
                    <h3>{selectedUser ? `Chat with ${selectedUser.username}` : "Select a user to start chatting"}</h3>
                </div>

                <div className="messages">
                    {selectedUser ? (
                        messages.map((m, i) => (
                            <div key={m.id || i} className={`message ${m.sent ? "sent" : ""}`}>
                                {m.sent && <button className="delete-btn" onClick={() => handleDelete(m.id)}>×</button>}
                                {m.image_url && <img src={`${BACKEND_URL}${m.image_url}`} alt="upload" className="message-image" />}
                                {m.text && <p>{m.text}</p>}
                            </div>
                        ))
                    ) : (
                        <div className="no-chat">Pick a contact from the left to begin.</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {preview && (
                    <div className="image-preview-container">
                        <img src={preview} alt="preview" />
                        <button onClick={() => { setImage(null); setPreview(null); }}>✕</button>
                    </div>
                )}

                <div className="message-input">
                    <label htmlFor="file-upload" className="custom-file-upload">📷</label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        disabled={!selectedUser}
                    />
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={!selectedUser}
                    />
                    <button onClick={handleSend} type="button" disabled={!selectedUser}>➡️</button>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;