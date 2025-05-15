import React, { useState, useEffect } from 'react';
import fox2 from '../avatar/fox2.png';  // Import the avatar
import giraffe2 from '../avatar/giraffe2.png';
import wolf1 from '../avatar/wolf1.png';

function Leaderboard() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5001/api/leaderboard')
      .then(res => res.json())
      .then(data => setEntries(data.leaderboard || []))
      .catch(err => console.error('Error loading leaderboard:', err));
  }, []);
  return (
    <div className="container">
      <h1 className="app-title">Leaderboard</h1>
      <div className="podium">
        <div className="podium-item second-place">
          <img src={giraffe2} alt="Second Place" className="avatar" />
          <div className="rank">2</div>
          <div className="podium-block"></div>
        </div>
        <div className="podium-item first-place">
          <img src={fox2} alt="Champion" className="avatar" />
          <div className="rank">1</div>
          <div className="podium-block"></div>
        </div>
        <div className="podium-item third-place">
          <img src={wolf1} alt="Third Place" className="avatar" />
          <div className="rank">3</div>
          <div className="podium-block"></div>
        </div>
      </div>

      <div className="leaderboard-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User Name</th>
                <th>Streak 🔥</th>
                <th>Pet Level 🌟</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((entry, idx) => (
                  <tr key={entry.username}>
                    <td>{idx + 1}</td>
                    <td>{entry.username}</td>
                    <td>{entry.score} days</td>
                    <td>-</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}

export default Leaderboard; 