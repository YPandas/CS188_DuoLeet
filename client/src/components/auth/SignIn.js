import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('loggin attempt with: ', {email, password});

        try {
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                navigate('/');
            } else {
                const errorData = await response.json();
                console.error('Login failed: ', errorData.error);
            }
        } catch (error) {
            console.error('Login error: ', error);
        }
    }

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    return (
        <div className="auth-container">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email address</label>
                    <input
                        type="email"
                        placeholder="Enter Registered Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn">Sign In</button>
            </form>
            <div className="auth-footer">
                <p>Don't have an account?</p>
                <button onClick={handleSignUpClick} className="btn btn-secondary">Sign Up</button>
            </div>
        </div>
    );
}

export default SignIn;