import React from 'react';
import fox2 from '../avatar/fox2.png';  // Import the avatar
import giraffe2 from '../avatar/giraffe2.png';
import wolf1 from '../avatar/wolf1.png';

function Leaderboard() {
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
            <tr>
              <td>1</td>
              <td>CodeMaster</td>
              <td>15 days</td>
              <td>Level 5</td>
            </tr>
            <tr>
              <td>2</td>
              <td>AlgoNinja</td>
              <td>12 days</td>
              <td>Level 4</td>
            </tr>
            <tr>
              <td>3</td>
              <td>ByteWarrior</td>
              <td>10 days</td>
              <td>Level 4</td>
            </tr>
            <tr>
              <td>4</td>
              <td>StackOverflowPro</td>
              <td>8 days</td>
              <td>Level 3</td>
            </tr>
            <tr>
              <td>5</td>
              <td>BugHunter</td>
              <td>7 days</td>
              <td>Level 3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard; 