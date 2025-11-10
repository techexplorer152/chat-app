import { useState } from 'react';
import axios from 'axios';
import React from 'react';
import './Login.css';

function Register({ setToken }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username: name,
                email,
                password,
            });

            localStorage.setItem('authToken', res.data.token);
            setToken && setToken(res.data.token);
            setMessage('Registration successful!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="login">
            <div className="container-Login">
                <h1 className="Welcome-Back">Create Account</h1>

                <input
                    className="Login-email"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    className="Login-email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="Login-password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="Login-button" onClick={handleSubmit}>
                    Register
                </button>

                {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
            </div>
        </div>
    );
}

export default Register;
