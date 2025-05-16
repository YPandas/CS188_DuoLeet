const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Check username availability
router.get('/check-username/:username', async (req, res) => {
    try {
        const result = await authController.checkUsername(req.params.username);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error checking username availability' });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const result = await authController.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const result = await authController.verifyEmail(req.params.token);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const result = await authController.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const result = await authController.refreshToken(refreshToken);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const result = await authController.logout(refreshToken);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const result = await authController.updateProfile(req.user.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get profile status
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const result = await authController.getProfileStatus(req.user.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 