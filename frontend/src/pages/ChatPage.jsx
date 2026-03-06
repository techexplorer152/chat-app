import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import LogoutButton from "../components/LogoutButton.jsx";
import GroupSettingsModal from "../components/GroupSettingsModal.jsx";
import CreateChannelModal from "../components/CreateChannelModal.jsx";
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
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");

    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    const isAdmin = selectedChat?.isGroup && selectedChat.members?.find(m => m.userId === user.id)?.role === "admin";

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
                socket.emit("delete_message", { messageId, groupId: selectedChat?.isGroup ? selectedChat.id : null });
                setMessages(prev => prev.filter(m => m.id !== messageId));
            }
        } catch (err) {
            console.error(err);
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

    const handleAddUserToGroup = async (userIdToAdd) => {
        try {
            const res = await fetch(`${API_URL}/groups/${selectedChat.id}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: userIdToAdd }),
            });
            if (res.ok) {
                const groupsRes = await fetch(`${API_URL}/groups/me`, { headers: { Authorization: `Bearer ${token}` } });
                const groupsData = await groupsRes.json();
                setGroups(groupsData);
                const updatedGroup = groupsData.find(g => g.id === selectedChat.id);
                if (updatedGroup) setSelectedChat({ ...updatedGroup, isGroup: true });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveMember = async (targetUserId) => {
        if (!window.confirm("Remove this member?")) return;
        try {
            const res = await fetch(`${API_URL}/groups/${selectedChat.id}/members/${targetUserId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const groupsRes = await fetch(`${API_URL}/groups/me`, { headers: { Authorization: `Bearer ${token}` } });
                const groupsData = await groupsRes.json();
                setGroups(groupsData);
                const updatedGroup = groupsData.find(g => g.id === selectedChat.id);
                if (updatedGroup) setSelectedChat({ ...updatedGroup, isGroup: true });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Delete this group forever?")) return;
        try {
            const res = await fetch(`${API_URL}/groups/${selectedChat.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setGroups(prev => prev.filter(g => g.id !== selectedChat.id));
                setSelectedChat(null);
                setIsSettingsModalOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getAvailableUsers = () => {
        if (!selectedChat || !selectedChat.isGroup) return [];
        const memberIds = selectedChat.members?.map(m => m.userId) || [];
        return users.filter(u => !memberIds.includes(u.id));
    };

    return (
        <div className={`chat-container ${selectedChat ? "user-selected" : ""}`}>
            <div className="sidebar">
                <h2>Slack Clone</h2>
                <div className="section">
                    <div className="section-header">
                        <h3>CHANNELS</h3>
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
                            {u.username}
                        </div>
                    ))}
                </div>
                <LogoutButton />
            </div>

            <div className="chat-area">
                <div className="chat-header">
                    <h3>{selectedChat ? (selectedChat.isGroup ? `# ${selectedChat.name}` : `Chat with ${selectedChat.username}`) : "Select a conversation"}</h3>
                    {selectedChat?.isGroup && (
                        <button className="add-btn" style={{width: 'auto', padding: '0 15px', fontSize: '14px', borderRadius: '4px'}} onClick={() => setIsSettingsModalOpen(true)}>
                            ⚙ Settings
                        </button>
                    )}
                </div>
                <div className="messages">
                    {selectedChat ? messages.map((m, i) => (
                        <div key={m.id || i} className={`message ${m.sent ? "sent" : ""}`}>
                            <div className="message-wrapper">
                                {!m.sent && <small className="sender-name">{m.sender?.username}</small>}
                                <div className="message-content">
                                    {m.imageUrl && <img src={`${SOCKET_URL}${m.imageUrl}`} className="message-image" alt="uploaded" />}
                                    {m.text && <p>{m.text}</p>}
                                    {m.sent && <button className="delete-btn" onClick={() => handleDelete(m.id)}>x</button>}
                                </div>
                            </div>
                        </div>
                    )) : <div className="no-chat">Pick a channel or user to start chatting.</div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="message-input">
                    <label className="custom-file-upload">
                        <div style={{borderRadius:"100%",background:"#e3dfd3",width:"25px",height:"25px",display:"flex",alignItems:"center",justifyContent:"center"}}>+</div>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleSelectImage} />
                    </label>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} disabled={!selectedChat} placeholder="Message..." />
                    <button onClick={handleSend} disabled={!selectedChat}>➤</button>
                </div>
            </div>

            <CreateChannelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                newGroupName={newGroupName}
                setNewGroupName={setNewGroupName}
                newGroupDesc={newGroupDesc}
                setNewGroupDesc={setNewGroupDesc}
                handleCreateGroup={handleCreateGroup}
            />

            <GroupSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                selectedChat={selectedChat}
                user={user}
                isAdmin={isAdmin}
                handleRemoveMember={handleRemoveMember}
                handleAddUserToGroup={handleAddUserToGroup}
                getAvailableUsers={getAvailableUsers}
                handleDeleteGroup={handleDeleteGroup}
            />
        </div>
    );
}

export default ChatPage;