require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
 app.use(express.json());
// In-memory leaderboard storage
let leaderboard = [];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Endpoint: Generate a LeetCode-style question
app.get('/api/question', async (req, res) => {
  try {
    const prompt =
      "Generate a LeetCode style coding question for practicing algorithms. Include a clear problem description, constraints, and only 2 examples. Write everything in plain text with no formatting, bold, or italics. Only put 130 characters in a line";
    
    const response = await axios.post(
      OPENAI_URL,
      {
        // Use GPT-4o Mini model for question generation
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert algorithm problem generator." },
          { role: "user", content: prompt }
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const question = response.data.choices[0].message.content;
    res.json({ question });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to generate question" });
  }
});
// Leaderboard endpoints
app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard });
});

app.post('/api/score', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }
  const existingEntry = leaderboard.find(entry => entry.username === username);
  if (existingEntry) {
    existingEntry.score += 1;
  } else {
    leaderboard.push({ username, score: 1 });
  }
  leaderboard.sort((a, b) => b.score - a.score);
  res.json({ leaderboard });
});

// Endpoint: Verify user's answer
app.post('/api/verify', async (req, res) => {
  const { question, userAnswer } = req.body;
  if (!question || !userAnswer) {
    return res.status(400).json({ error: 'Missing question or userAnswer in request body' });
  }
  try {
    // Prompt the LLM to return a JSON object with correctness and explanation
    const verifyPrompt = `Given the following LeetCode-style problem:\n${question}\n\nAnd the user's solution code:\n${userAnswer}\n\nRespond ONLY with a JSON object containing two fields:\n"isCorrect": true or false, indicating if the solution is correct, and\n"explanation": a brief explanation of why the solution is correct or why it fails.`;
    const response = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a coding problem evaluator.' },
          { role: 'user', content: verifyPrompt }
        ],
        max_tokens: 200
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    const content = response.data.choices[0].message.content.trim();
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      // If JSON parse fails, return raw content as explanation and assume incorrect
      return res.json({ isCorrect: false, evaluation: content });
    }
    const { isCorrect, explanation } = parsed;
    return res.json({ isCorrect: Boolean(isCorrect), evaluation: explanation });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to verify solution' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
