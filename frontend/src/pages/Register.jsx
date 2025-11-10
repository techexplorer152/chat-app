import { useState } from "react";
import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register({ setToken }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", {
                username,
                email,
                password,
            });

            console.log("User registered:", res.data.user);
        } catch (err) {
            console.error("Registration error:", err);
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

                <button className="Register-button" onClick={handleSubmit}>
                    Register
                </button>

                <p className="go-to-login">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;

