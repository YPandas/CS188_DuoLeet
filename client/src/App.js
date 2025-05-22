import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Leaderboard from "./components/Leaderboard";
import Onboarding from "./components/Onboarding";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";
import "./index.css";
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import PlanSelection from './components/onboarding/PlanSelection';
import OrganizationSetup from './components/onboarding/OrganizationSetup';

export const topics = {
  Arrays: `Arrays are contiguous, fixed-size, index-based collections that store elements of the same type.
    \n Access: O(1) time to read/write by index.
    \n Search: O(n) to scan for a value unless sorted (then O(log n) with binary search).
    \n Insertion/Deletion: O(n) worst-case, since elements must shift.
    \n Use cases: lookup tables, sliding-window, two-pointer patterns, and building other structures.`,

  Recursion: `Recursion is when a function calls itself to solve smaller instances until hitting a base case.
    \n Each call uses stack space (depth = active calls).
    \n Must define base cases to terminate.
    \n Pros: elegant for divide-and-conquer (e.g. quicksort, tree traversals), top-down DP.
    \n Cons: risk of stack overflow and repeated work (use memoization).`,

  "Dynamic Programming": `DP reuses solutions to overlapping subproblems by caching (memoization) or building iteratively (tabulation).
    \n Key: optimal substructure + overlapping subproblems.
    \n Memoization (top-down): cache recursive calls.
    \n Tabulation (bottom-up): fill an array/table from smallest subproblems.
    \n Time: often O(n·k), Space: O(n) (can often optimize to O(1)).
    \n Use cases: knapsack, coin change, sequence alignment, grid paths.`
};

export const problems = [
  {
    id: "two-sum",
    topic: "Arrays",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 ≤ nums.length ≤ 10^5",
      "-10^9 ≤ nums[i], target ≤ 10^9"
    ],
    example: {
      input: { nums: [2, 7, 11, 15], target: 9 },
      output: [0, 1],
      explanation: "nums[0] + nums[1] == 9"
    },
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
}`,
    explanation:
      "Traverse once (O(n)); at each nums[i] check if (target - nums[i]) exists in map. If yes, return indices; else store nums[i] → i."
  },
  {
    id: "fibonacci-number",
    topic: "Recursion",
    title: "Fibonacci Number",
    description:
      "Return F(n) where F(0)=0, F(1)=1, and for n>1: F(n)=F(n-1)+F(n-2).",
    constraints: ["0 ≤ n ≤ 30"],
    example: {
      input: { n: 5 },
      output: 5,
      explanation: "F(5) = F(4) + F(3) = 3 + 2"
    },
    solution: `function fib(n, memo = {}) {
  if (n < 2) return n;
  if (memo[n] != null) return memo[n];
  memo[n] = fib(n-1, memo) + fib(n-2, memo);
  return memo[n];
}`,
    explanation:
      "Base cases n<2 return immediately. Memoize to avoid exponential calls, making O(n) time."
  },
  {
    id: "climbing-stairs",
    topic: "Dynamic Programming",
    title: "Climbing Stairs",
    description:
      "You are climbing a staircase of n steps. Each move, you can climb 1 or 2 steps. How many distinct ways to reach the top?",
    constraints: ["1 ≤ n ≤ 45"],
    example: {
      input: { n: 4 },
      output: 5,
      explanation:
        "Ways: [1+1+1+1], [1+1+2], [1+2+1], [2+1+1], [2+2]"
    },
    solution: `function climbStairs(n) {
  const dp = Array(n + 1).fill(0);
  dp[0] = dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}`,
    explanation:
      "dp[i] = ways to reach step i: from i-1 or i-2; build bottom-up in O(n)."
  }
];

function MainPage() {
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setEvaluation("");
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch("http://localhost:5001/api/question", {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });
      const data = await response.json();
      setQuestion(data.question);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch("http://localhost:5001/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({ question, userAnswer })
      });
      const data = await res.json();
      setEvaluation(data.evaluation);
      setIsCorrect(data.isCorrect);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Protected route check
  if (!user) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="container">
      <h1 className="app-title">Duo-Leetcode</h1>

      {/* ---------------- Learn + Prepare Section ---------------- */}
      <div className="section">
        <h2 className="section-title">Learn & Prepare</h2>
        <div className="learn-buttons">
          {Object.keys(topics).map((topic) => (
            <button
              key={topic}
              className={`btn learn-btn ${selectedTopic === topic ? "active" : ""}`}
              onClick={() => {
                setSelectedTopic(topic);
                setSelectedProblem(null);
              }}
            >
              {topic}
            </button>
          ))}
        </div>

        {selectedTopic && (
          <>
            {/* ---------- Topic Summary ---------- */}
            <div className="topic-summary">
              <h3>{selectedTopic}</h3>
              <ul>
                {topics[selectedTopic]
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, idx) => (
                    <li key={idx}>{line.trim()}</li>
                  ))}
              </ul>
            </div>

            {/* ---------- Topic Problems ---------- */}
            <h3 className="subsection-title">Example Problems</h3>
            <div className="learn-buttons">
              {problems
                .filter((p) => p.topic === selectedTopic)
                .map((problem) => (
                  <button
                    key={problem.id}
                    className={`btn learn-btn ${
                      selectedProblem?.id === problem.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedProblem(problem);
                      setQuestion("");
                      setUserAnswer("");
                      setEvaluation("");
                      setIsCorrect(null);
                    }}
                  >
                    {problem.title}
                  </button>
                ))}
            </div>

            {selectedProblem && (
              <div className="section">
                <h4>{selectedProblem.title}</h4>
                <p>{selectedProblem.description}</p>
                <ul>
                  {selectedProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <h5>Example:</h5>
                <pre className="content-box">
                  {`Input: ${JSON.stringify(
                    selectedProblem.example.input,
                    null,
                    2
                  )}
Output: ${JSON.stringify(selectedProblem.example.output)}
Explanation: ${selectedProblem.example.explanation}`}
                </pre>
                <h5>Solution:</h5>
                <pre className="content-box">{selectedProblem.solution}</pre>
                <h5>Explanation:</h5>
                <p>{selectedProblem.explanation}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ------------- Generate Problem ------------- */}
      <div className="section">
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
            />
            <br />
            <button
              className="btn"
              onClick={submitAnswer}
              disabled={loading || !userAnswer}
            >
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
                    const userRes = await fetch("http://localhost:5001/api/user");
                    const userData = await userRes.json();
                    const { username } = userData;
                    await fetch("http://localhost:5001/api/score", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ username })
                    });
                    window.alert("Added to leaderboard!");
                  } catch (err) {
                    console.error(err);
                    window.alert("Could not add to leaderboard");
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
    </div>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  
  return (
    <Router>
      <nav className="navigation">
        <Link to="/" className="btn nav-btn">🏠 Home</Link>
        <Link to="/leaderboard" className="btn nav-btn">🏆 Leaderboard</Link>
        {user && (
          <button onClick={logout} className="btn nav-btn">🚪 Logout</button>
        )}
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
