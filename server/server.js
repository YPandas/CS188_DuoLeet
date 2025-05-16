require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const passport = require('./config/passport');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const onboardingRoutes = require('./routes/onboarding');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//auth routes
app.use('/api/auth', authRoutes);

app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    failureRedirect: '/login'
  })
);

// Add callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: req.user.id,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/oauth2/redirect/google?token=${token}`);
  }
);

//auth status check
app.get('/auth/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      onboarding: req.user.onboarding
    } : null
  });
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000');
  });
});

//onboarding routes
app.use('/api/onboarding', onboardingRoutes);

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
    return res.status(400).json({ error: "Missing question or userAnswer in request body" });
  }
  
  try {
    const prompt = `
Given the following LeetCode-style problem:
${question}

And the user's solution code:
${userAnswer}

Evaluate the solution. Explain why the solution is either correct or incorrect.
    `;
    
    const response = await axios.post(
      OPENAI_URL,
      {
        // Use GPT-4o Mini model for solution verification
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a coding problem evaluator." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const evaluation = response.data.choices[0].message.content;
    res.json({ evaluation });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to verify solution" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
