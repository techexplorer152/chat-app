import { useState } from 'react';
import axios from 'axios';
import React from "react";
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                `${BACKEND_URL}/api/auth/login`,
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
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="Login-password"
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="Login-button" type="submit">Enter</button>
                </form>
                <h3 className="go-to-register">
                    Don't have an account? <Link to="/register">Register</Link>
                </h3>
            </div>
        </div>
    );
}

export default Login;