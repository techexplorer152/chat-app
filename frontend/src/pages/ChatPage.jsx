import React, { useState } from "react";
import "./ChatPage.css";

function ChatPage() {
    const [messages, setMessages] = useState([
        { text: "Hello! Welcome to the chat app.", sent: false },
        { text: "Thanks! Excited to be here 😄", sent: true },
        { text: "You can send emojis, files, or even video calls.", sent: false },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { text: input, sent: true }]);
        setInput("");
    };

    return (
        <div className="chat-container">
            <div className="sidebar">
                <h2>ChatApp</h2>
                <div className="chat-list">
                    {["Group Chat 1", "Group Chat 2", "John Doe", "Jane Smith"].map((name, i) => (
                        <div key={i} className="chat-item">
                            <img src="https://via.placeholder.com/40" alt="user" />
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
