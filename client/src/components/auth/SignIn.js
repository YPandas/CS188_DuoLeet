import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            setError(error.message || 'Failed to sign in');
            console.error('Login error:', error);
        }
    }

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    return (
        <div className="auth-container">
            <h2>Sign In</h2>
            {error && <div className="error-message">{error}</div>}
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