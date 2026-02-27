import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import "./App.css";
import React from "react";


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <div>
            <Routes>

                <Route path="/" element={<Navigate to="/chat" replace />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />


                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;