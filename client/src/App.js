import React, { useState } from "react";
import "./index.css";

function App() {
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);

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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question, userAnswer })
      });
      const data = await response.json();
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error("Error verifying answer:", error);
    }
    setLoading(false);
  };

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

export default App;