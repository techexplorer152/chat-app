import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import LogoutButton from "../components/LogoutButton.jsx";
import "./ChatPage.css";

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:5000/api`;
const SOCKET_URL = `http://${currentHost}:5000`;

const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
});

function ChatPage() {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");

    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, groupsRes] = await Promise.all([
                    fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/groups/me`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const usersData = await usersRes.json();
                const groupsData = await groupsRes.json();
                setUsers(Array.isArray(usersData) ? usersData.filter(u => u.id !== user.id) : []);
                setGroups(Array.isArray(groupsData) ? groupsData : []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [user.id, token]);


    useEffect(() => {
        if (!selectedChat || !selectedChat.isGroup) return;
        socket.emit("join_group", selectedChat.id);
        return () => socket.emit("leave_group", selectedChat.id);
    }, [selectedChat]);


    useEffect(() => {
        if (!user.id || !selectedChat) return;
        const fetchMessages = async () => {
            const url = selectedChat.isGroup
                ? `${API_URL}/messages/group/${selectedChat.id}`
                : `${API_URL}/messages?user1=${user.id}&user2=${selectedChat.id}`;
            try {
                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setMessages(data.map(m => ({ ...m, sent: Number(m.senderId) === Number(user.id) })));
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [user.id, selectedChat, token]);


    useEffect(() => {
        if (!user.id) return;
        socket.connect();

        socket.on("receive_message", msg => {
            let isRelevant = false;
            if (selectedChat?.isGroup) {
                isRelevant = Number(msg.groupId) === Number(selectedChat.id);
            } else {
                isRelevant =
                    (Number(msg.senderId) === Number(selectedChat?.id) && Number(msg.receiverId) === Number(user.id)) ||
                    (Number(msg.senderId) === Number(user.id) && Number(msg.receiverId) === Number(selectedChat?.id));
            }
            if (isRelevant) {
                setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, sent: Number(msg.senderId) === Number(user.id) }]);
            }
        });


        socket.on("message_deleted", (deletedId) => {
            setMessages(prev => prev.filter(m => m.id !== deletedId));
        });

        return () => {
            socket.off("receive_message");
            socket.off("message_deleted");
            socket.disconnect();
        };
    }, [user.id, selectedChat]);

    const handleSelectImage = e => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSend = async () => {
        if ((!input.trim() && !image) || !selectedChat) return;
        try {
            const formData = new FormData();
            formData.append("text", input);
            formData.append("sender_id", user.id);
            if (selectedChat.isGroup) formData.append("groupId", selectedChat.id);
            else formData.append("receiver_id", selectedChat.id);
            if (image) formData.append("image", image);

            const res = await fetch(`${API_URL}/messages`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });
            const savedMessage = await res.json();
            socket.emit("send_message", savedMessage);
            setInput("");
            setImage(null);
            setPreview(null);
        } catch (err) {
            console.error(err);
        }
    };


    const handleDelete = async (messageId) => {
        try {
            const res = await fetch(`${API_URL}/messages/${messageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {

                socket.emit("delete_message", {
                    messageId,
                    groupId: selectedChat?.isGroup ? selectedChat.id : null
                });

                setMessages(prev => prev.filter(m => m.id !== messageId));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleCreateGroup = async e => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        try {
            const res = await fetch(`${API_URL}/groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newGroupName, description: newGroupDesc }),
            });
            if (res.ok) {
                const newGroup = await res.json();
                setGroups(prev => [...prev, newGroup]);
                setSelectedChat({ ...newGroup, isGroup: true });
                setIsModalOpen(false);
                setNewGroupName("");
                setNewGroupDesc("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`chat-container ${selectedChat ? "user-selected" : ""}`}>
            <div className="sidebar">
                <h2>Slack Clone</h2>
                <div className="section">
                    <div className="section-header">
                        <h3>Channels</h3>
                        <button className="add-btn" onClick={() => setIsModalOpen(true)}>+</button>
                    </div>
                    {groups.map(g => (
                        <div key={`g-${g.id}`} className={`chat-item ${selectedChat?.id === g.id && selectedChat.isGroup ? "active" : ""}`}
                             onClick={() => setSelectedChat({ ...g, isGroup: true })}>
                            # {g.name}
                        </div>
                    ))}
                </div>
                <div className="section">
                    <h3>Direct Messages</h3>
                    {users.map(u => (
                        <div key={`u-${u.id}`} className={`chat-item ${selectedChat?.id === u.id && !selectedChat.isGroup ? "active" : ""}`}
                             onClick={() => setSelectedChat({ ...u, isGroup: false })}>
                            ● {u.username}
                        </div>
                    ))}
                </div>
                <LogoutButton />
            </div>

            <div className="chat-area">
                <div className="chat-header">
                    <h3>{selectedChat ? (selectedChat.isGroup ? `# ${selectedChat.name}` : `Chat with ${selectedChat.username}`) : "Select a conversation"}</h3>
                </div>
                <div className="messages">
                    {selectedChat ? messages.map((m, i) => (
                        <div key={m.id || i} className={`message ${m.sent ? "sent" : ""}`}>
                            <div className="message-wrapper">
                                {!m.sent && <small className="sender-name">{m.sender?.username}</small>}
                                <div className="message-content">
                                    {m.imageUrl && <img src={`${SOCKET_URL}${m.imageUrl}`} className="message-image" alt="uploaded" />}
                                    {m.text && <p>{m.text}</p>}


                                    {m.sent && (
                                        <button className="delete-btn" onClick={() => handleDelete(m.id)}>x</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : <div className="no-chat">Pick a channel or user to start chatting.</div>}
                    <div ref={messagesEndRef} />
                </div>

                {preview && (
                    <div className="image-preview-container">
                        <img src={preview} alt="Preview" />
                        <button onClick={() => { setImage(null); setPreview(null); }}>✕</button>
                    </div>
                )}

                <div className="message-input">
                    <label className="custom-file-upload">
                        📎
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleSelectImage} />
                    </label>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} disabled={!selectedChat} placeholder="Message..." />
                    <button onClick={handleSend} disabled={!selectedChat}>➤</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Create New Channel</h3>
                        <form onSubmit={handleCreateGroup}>
                            <input type="text" placeholder="Channel Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
                            <input type="text" placeholder="Description (Optional)" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatPage;