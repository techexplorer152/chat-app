import { useState } from 'react';
import axios from 'axios';
import React from "react";
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const currentHost = window.location.hostname;
    const DYNAMIC_BACKEND_URL = `http://${currentHost}:5000`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                `${DYNAMIC_BACKEND_URL}/api/auth/login`,
                { email, password },
                { withCredentials: true }
            );

            const { user } = res.data;

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                navigate("/chat");
            }
        } catch (err) {
            console.error('Login error:', err);
            alert("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="container-Login">
                <h1 className="Welcome-Back">Welcome Back</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        className="Login-email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="Login-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        className="Login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Enter"}
                    </button>
                </form>
                <h3 className="go-to-register">
                    Don't have an account? <Link to="/register">Register</Link>
                </h3>
            </div>
        </div>
    );
}

export default Login;