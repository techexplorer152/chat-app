import { useState } from "react";
import axios from "axios";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const DYNAMIC_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://chatappbackend1-a6n8vlg3.b4a.run";

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(
                `${DYNAMIC_BACKEND_URL}/api/auth/register`,
                { username, email, password },
                { withCredentials: true }
            );

            const { user } = res.data;
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                navigate("/chat");
            }
        } catch (err) {
            console.error("Registration error:", err);
            alert("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register">
            <div className="container-Register">
                <h1 className="Create-Account">Create Account</h1>

                <input
                    className="Register-input"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="Register-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="Register-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="Register-button"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="go-to-login">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
