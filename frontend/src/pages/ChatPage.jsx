import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./ChatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
<<<<<<< HEAD
=======
const API_URL = import.meta.env.VITE_API_URL;

>>>>>>> 91e5905870a3cac11061e5e020df641600cd53ab
const socket = io(SOCKET_URL, { autoConnect: false });

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));


    useEffect(() => {
        if (!user) return;

        socket.connect();
        socket.emit("join", user.id);
<<<<<<< HEAD


        const fetchMessages = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages`);
                const data = await res.json();
                setMessages(
                    data.map(m => ({
                        text: m.text,
                        senderId: m.sender_id,
                        sent: m.sender_id === user.id
                    }))
                );
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };
        fetchMessages();
=======
>>>>>>> 91e5905870a3cac11061e5e020df641600cd53ab


        socket.on("receive_message", (msg) => {
<<<<<<< HEAD
            setMessages(prev => [
                ...prev,
                { text: msg.text, senderId: msg.sender_id, sent: msg.sender_id === user.id }
            ]);
=======
            if (
                msg.senderId === selectedUser?.id ||
                msg.receiverId === selectedUser?.id
            ) {
                setMessages((prev) => [
                    ...prev,
                    { ...msg, sent: msg.senderId === user.id }
                ]);
            }
>>>>>>> 91e5905870a3cac11061e5e020df641600cd53ab
        });

        return () => {
            socket.off("receive_message");
            socket.disconnect();
        };
<<<<<<< HEAD
    }, [user]);
=======
    }, [user?.id, selectedUser?.id]);


    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`${API_URL}/users`);
            const data = await res.json();
            setUsers(data.filter((u) => u.id !== user.id));
        };
        fetchUsers();
    }, []);


    useEffect(() => {
        if (!selectedUser) return;

        const loadMessages = async () => {
            const res = await fetch(
                `${API_URL}/messages/${user.id}/${selectedUser.id}`
            );
            const data = await res.json();

            const formatted = data.map((m) => ({
                ...m,
                sent: m.senderId === user.id
            }));

            setMessages(formatted);
        };

        loadMessages();
    }, [selectedUser]);

>>>>>>> 91e5905870a3cac11061e5e020df641600cd53ab

    const handleSend = () => {
        if (!input.trim() || !selectedUser || !user) return;

        const messageData = {
            text: input,
<<<<<<< HEAD
            senderId: user.id
        };

        socket.emit("send_message", messageData);


        setMessages(prev => [...prev, { ...messageData, sent: true }]);
=======
            senderId: user.id,
            receiverId: selectedUser.id,
        };


        setMessages((prev) => [
            ...prev,
            { ...messageData, sent: true }
        ]);

        socket.emit("send_message", messageData);
>>>>>>> 91e5905870a3cac11061e5e020df641600cd53ab
        setInput("");
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
                            <img src="https://dummyimage.com/40x40/000/fff" alt="" />
                            <span>{u.username}</span>
                        </div>
                    ))}
                </div>
            </div>


            <div className="chat-area">


                <div className="chat-header">
                    <h3>{selectedUser ? selectedUser.username : "Select user"}</h3>
                </div>


                <div className="messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.sent ? "sent" : ""}`}>
                            {m.text}
                        </div>
                    ))}
                </div>


                {selectedUser && (
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
                )}
            </div>
        </div>
    );
}

export default ChatPage;
