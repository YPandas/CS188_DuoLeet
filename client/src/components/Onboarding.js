import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    reason: '',
    goal: {
      daily: 0,
      weekly: 0,
      monthly: 0
    },
    school: '',
    username: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('goal.')) {
      const goalField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        goal: {
          ...prev.goal,
          [goalField]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Failed to submit onboarding data');
      }
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="container">
      <h1 className="app-title">Welcome to DuoLeet!</h1>
      <div className="onboarding-form">
        {step === 1 && (
          <div className="step">
            <h2>Why are you here?</h2>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="select-input"
            >
              <option value="">Select a reason</option>
              <option value="interview_prep">Interview Preparation</option>
              <option value="skill_improvement">Improve Coding Skills</option>
              <option value="competition">Competitive Programming</option>
              <option value="fun">Just for Fun</option>
            </select>
            <button className="btn" onClick={nextStep}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Set Your Goals</h2>
            <div className="goal-inputs">
              <div>
                <label>Daily Problems:</label>
                <input
                  type="number"
                  name="goal.daily"
                  value={formData.goal.daily}
                  onChange={handleInputChange}
                  min="0"
                  className="number-input"
                />
              </div>
              <div>
                <label>Weekly Problems:</label>
                <input
                  type="number"
                  name="goal.weekly"
                  value={formData.goal.weekly}
                  onChange={handleInputChange}
                  min="0"
                  className="number-input"
                />
              </div>
              <div>
                <label>Monthly Problems:</label>
                <input
                  type="number"
                  name="goal.monthly"
                  value={formData.goal.monthly}
                  onChange={handleInputChange}
                  min="0"
                  className="number-input"
                />
              </div>
            </div>
            <div className="button-group">
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn" onClick={nextStep}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>Connect with Peers</h2>
            <div className="input-group">
              <label>School/Organization:</label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                className="text-input"
                placeholder="Enter your school or organization"
              />
            </div>
            <div className="input-group">
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="text-input"
                placeholder="Choose a username"
              />
            </div>
            <div className="button-group">
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn" onClick={handleSubmit}>Complete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding; 