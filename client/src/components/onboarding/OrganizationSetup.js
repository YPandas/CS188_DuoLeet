import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OrganizationSetup() {
    const [formData, setFormData] = useState({
        organization: '',
        peers: ['']  // Array to hold multiple peer usernames
    });
    const navigate = useNavigate();

    const handleOrganizationChange = (e) => {
        setFormData(prev => ({
            ...prev,
            organization: e.target.value
        }));
    };

    const handlePeerChange = (index, value) => {
        const newPeers = [...formData.peers];
        newPeers[index] = value;
        setFormData(prev => ({
            ...prev,
            peers: newPeers
        }));
    };

    const addPeerField = () => {
        setFormData(prev => ({
            ...prev,
            peers: [...prev.peers, '']
        }));
    };

    const removePeerField = (index) => {
        setFormData(prev => ({
            ...prev,
            peers: prev.peers.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get all stored data
        const registrationData = JSON.parse(localStorage.getItem('registrationData'));
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData'));

        // Combine all data
        const finalData = {
            ...registrationData,
            onboarding: {
                ...onboardingData,
                organization: formData.organization,
                peers: formData.peers.filter(peer => peer.trim() !== '')
            }
        };

        console.log('final data: ', finalData);

        try {
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(finalData)
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                
                // Clean up temporary storage
                localStorage.removeItem('registrationData');
                localStorage.removeItem('onboardingData');
                
                // Navigate to dashboard
                navigate('/');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Handle error appropriately
        }
    };

    return (
        <div className="auth-container">
            <h2>Your Learning Community</h2>
            <p className="subtitle">Connect with your peers for collaborative learning</p>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>University/Organization</label>
                    <input
                        type="text"
                        value={formData.organization}
                        onChange={handleOrganizationChange}
                        placeholder="Enter your university or organization name"
                        className="text-input"
                    />
                </div>

                <div className="form-group">
                    <label>Add Peers (Optional)</label>
                    {formData.peers.map((peer, index) => (
                        <div key={index} className="peer-input-group">
                            <input
                                type="text"
                                value={peer}
                                onChange={(e) => handlePeerChange(index, e.target.value)}
                                placeholder="Enter peer's username"
                                className="text-input"
                            />
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => removePeerField(index)}
                                    className="btn btn-secondary btn-small"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addPeerField}
                        className="btn btn-secondary"
                    >
                        Add Another Peer
                    </button>
                </div>

                <button type="submit" className="btn">Complete Registration</button>
            </form>
        </div>
    );
}

export default OrganizationSetup; 