import { useState } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ChatPage from './pages/ChatPage.jsx';
import React from 'react'

function App() {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [page, setPage] = useState('login');

    if (token) {
        return <ChatPage />;
    }

    return (
        <div>
            {page === 'login' && <Login setToken={setToken} />}
            {page === 'register' && <Register setToken={setToken} />}
            <button onClick={() => setPage(page === 'login' ? 'register' : 'login')}>
                {page === 'login' ? 'Go to Register' : 'Go to Login'}
            </button>
        </div>
    );
}

export default App;

