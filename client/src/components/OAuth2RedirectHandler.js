import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuth2RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the URL parameters that were sent with the redirect
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Store the token in localStorage or your preferred storage method
      localStorage.setItem('token', token);
      
      // Redirect to onboarding or dashboard based on user status
      fetch('http://localhost:5001/auth/status', {
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          if (!data.user.onboarding || !data.user.onboarding.completed) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        })
        .catch(error => {
          console.error('Error checking auth status:', error);
          navigate('/');
        });
    } else if (error) {
      // Handle error case
      console.error('OAuth error:', error);
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="container">
      <h1 className="app-title">Processing login...</h1>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
}

export default OAuth2RedirectHandler; 