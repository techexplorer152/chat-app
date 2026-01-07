import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LogoutButton.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;
