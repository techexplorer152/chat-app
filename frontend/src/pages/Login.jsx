import { useState } from 'react'

import './Login.css'

function Login() {
    return (
        <div className="login">

            <div className="container-Login">

                <h1 className="Welcome-Back">Welcome Back</h1>

                <input className="Login-email" type="email" placeholder="email"></input>
                <input className="Login-password" type="password" placeholder="password"></input>

                <button className="Login-button">Enter</button>
            </div>

        </div>
    );
}

export default Login;import React from 'react';
