import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Leaderboard from "./components/Leaderboard";
import Onboarding from "./components/Onboarding";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";
import "./index.css";
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import PlanSelection from './components/onboarding/PlanSelection';
import OrganizationSetup from './components/onboarding/OrganizationSetup';

function MainPage() {
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/auth/status', {
        credentials: 'include'
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const fetchQuestion = async () => {
    setLoading(true);
    setEvaluation("");
    try {
      const response = await fetch("http://localhost:5001/api/question", {
        credentials: 'include'
      });
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
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ question, userAnswer })
      });
      const data = await response.json();
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error("Error verifying answer:", error);
    }
    setLoading(false);
  };

  // if (!user) {
  //   return (
  //     <div className="container">
  //       <h1 className="app-title">Programming Interview Practice App</h1>
  //       <div className="auth-buttons">
  //         <Link to="/signin" className="btn">Sign In</Link>
  //         <Link to="/signup" className="btn">Sign Up</Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="container">
      <h1 className="app-title">Programming Interview Practice App</h1>
      <button className="btn" onClick={fetchQuestion} disabled={loading}>
        {loading ? "Loading..." : "Generate Question"}
      </button>
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
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/plan" element={<PlanSelection />} />
        <Route path="/onboarding/organization" element={<OrganizationSetup />} />
        <Route path="/oauth2/redirect/google" element={<OAuth2RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;