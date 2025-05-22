import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PlanSelection() {
    const [goalType, setGoalType] = useState('none');  // 'none', 'daily', 'weekly', or 'monthly'
    const [goalCount, setGoalCount] = useState('');
    const navigate = useNavigate();

    const handleGoalTypeChange = (e) => {
        setGoalType(e.target.value);
        setGoalCount(''); // Reset count when changing type
    };

    const handleGoalCountChange = (e) => {
        const value = e.target.value;
        if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
            setGoalCount(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create plan object based on selected goal type
        const plan = {
            daily: goalType === 'daily' ? Number(goalCount) : null,
            weekly: goalType === 'weekly' ? Number(goalCount) : null,
            monthly: goalType === 'monthly' ? Number(goalCount) : null
        };

        // Store plan data
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        localStorage.setItem('onboardingData', JSON.stringify({
            ...onboardingData,
            plan
        }));

        // Navigate to organization selection
        navigate('/onboarding/organization');
    };

    return (
        <div className="auth-container">
            <h2>Set Your Practice Goals</h2>
            <p className="subtitle">How often would you like to practice? (Optional)</p>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Goal Frequency</label>
                    <select
                        value={goalType}
                        onChange={handleGoalTypeChange}
                        className="select-input"
                    >
                        <option value="none">No specific goal</option>
                        <option value="daily">Daily goal</option>
                        <option value="weekly">Weekly goal</option>
                        <option value="monthly">Monthly goal</option>
                    </select>
                </div>

                {goalType !== 'none' && (
                    <div className="form-group">
                        <label>Number of Problems</label>
                        <input
                            type="number"
                            value={goalCount}
                            onChange={handleGoalCountChange}
                            min="0"
                            max="100"
                            placeholder={`Problems per ${goalType.slice(0, -2)}`}
                            className="number-input"
                        />
                        <p className="helper-text">
                            Set how many problems you aim to solve {goalType.slice(0, -2)}ly
                        </p>
                    </div>
                )}

                <button type="submit" className="btn">
                    {goalType === 'none' ? 'Skip Goal Setting' : 'Set Goal and Continue'}
                </button>
            </form>
        </div>
    );
}

export default PlanSelection; 