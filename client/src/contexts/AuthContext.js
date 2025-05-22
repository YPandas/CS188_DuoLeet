import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;

        try {
            const response = await fetch('http://localhost:5001/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) throw new Error('Failed to refresh token');

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            return null;
        }
    };

    const checkAuthStatus = async () => {
        try {
            let accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5001/api/auth/status', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include'
            });
            
            if (response.status === 401) {
                // Token expired, try to refresh
                accessToken = await refreshAccessToken();
                if (!accessToken) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // Retry with new token
                const retryResponse = await fetch('http://localhost:5001/api/auth/status', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include'
                });
                
                if (!retryResponse.ok) throw new Error('Failed to verify auth status');
                const data = await retryResponse.json();
                setUser(data.user);
            } else {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        await checkAuthStatus();
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await fetch('http://localhost:5001/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    // Set up periodic token refresh
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            if (user) {
                refreshAccessToken();
            }
        }, 14 * 60 * 1000); // Refresh token every 14 minutes (assuming 15-minute token lifetime)

        return () => clearInterval(refreshInterval);
    }, [user]);

    // Initial auth check
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 