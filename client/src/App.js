import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

function MainPage() {
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  // Topics for Learn section
  const topics = {
    Arrays: "Arrays are fixed-size, index-based collections allowing O(1) access by index. Inserting or deleting elements can take O(n) as others shift.",
    Recursion: "Recursion is when functions call themselves to solve smaller instances of a problem. It needs a base case to stop, else it loops infinitely.",
    "Dynamic Programming": "Dynamic Programming optimizes by solving overlapping subproblems once and storing results (memoization) or building up (tabulation)."
  };

  const fetchQuestion = async () => {
    setLoading(true);
    setEvaluation("");
    try {
      const response = await fetch("http://localhost:5001/api/question");
      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userAnswer })
      });
      const data = await response.json();
      setEvaluation(data.evaluation);
      setIsCorrect(data.isCorrect);
    } catch (error) {
      console.error("Error verifying answer:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="app-title">Duo-Leetcode</h1>
       {/* Learn section */}
      <div className="section">
        <h2 className="section-title">Learn</h2>
        <div className="learn-buttons">
          {Object.keys(topics).map((topic) => (
            <button
              key={topic}
              className="btn learn-btn"
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
        {selectedTopic && (
          <div className="topic-summary">
            <h3>{selectedTopic}</h3>
            <p>{topics[selectedTopic]}</p>
          </div>
        )}
      </div>
              <h2 className="section-title">Practice</h2>
      <div className="generate-wrapper">
        <button className="btn" onClick={fetchQuestion} disabled={loading}>
          {loading ? "Loading..." : "Generate Question"}
        </button>
      </div>
     
      {question && (
        <div className="section">
          <h2 className="section-title">Problem:</h2>
          <pre className="content-box">{question}</pre>
        </div>
      )}
      {question && (
        <div className="section">
          <h2 className="section-title">Your Answer:</h2>
          <textarea
            className="textarea"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={10}
            placeholder="Write your solution here..."
          ></textarea>
          <br />
          <button className="btn" onClick={submitAnswer} disabled={loading || !userAnswer}>
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      )}
      {evaluation && (
        <div className="section">
          <h2 className="section-title">AI Evaluation:</h2>
          <pre className="content-box">{evaluation}</pre>
          {isCorrect && (
            <button
              className="btn"
              onClick={async () => {
                setLoading(true);
                try {
                  // Fetch logged-in user from backend
                  const userRes = await fetch('http://localhost:5001/api/user');
                  if (!userRes.ok) throw new Error('Failed to fetch user info');
                  const userData = await userRes.json();
                  const { username } = userData;
                  if (!username) throw new Error('No username returned');
                  // Submit score for this user
                  const scoreRes = await fetch('http://localhost:5001/api/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                  });
                  if (!scoreRes.ok) throw new Error('Failed to add to leaderboard');
                  window.alert('Added to leaderboard!');
                } catch (err) {
                  console.error('Error adding to leaderboard:', err);
                  window.alert('Could not add to leaderboard: Please Implement Backend');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Add to Leaderboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="navigation">
        <Link to="/" className="btn nav-btn">🏠 Home</Link>
        <Link to="/leaderboard" className="btn nav-btn">🏆 Leaderboard</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;