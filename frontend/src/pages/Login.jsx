import { useState } from 'react';
import axios from 'axios';
import React  from "react";
import './Login.css';

function Login({ setToken }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            localStorage.setItem('authToken', res.data.token);
            setToken && setToken(res.data.token);
            setMessage('Login successful!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login">
            <div className="container-Login">
                <h1 className="Welcome-Back">Welcome Back</h1>

                <input
                    className="Login-email"
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="Login-password"
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="Login-button" onClick={handleSubmit}>
                    Enter
                </button>

                {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
            </div>
        </div>
    );
}

export default Login;

