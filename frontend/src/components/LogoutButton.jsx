import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LogoutButton.css';

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = async () => {

        const currentHost = window.location.hostname;
        const DYNAMIC_BACKEND_URL = `http://${currentHost}:5000`;

        try {

            await axios.post(`${DYNAMIC_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
        } catch (err) {
            console.warn('Backend logout failed, clearing local storage anyway.', err);
        } finally {

            localStorage.removeItem('user');
            localStorage.removeItem('token');


            navigate('/login');
            window.location.reload();
        }
    };

    return (
        <button className="logout-btn" onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;