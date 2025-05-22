const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Check auth status
router.get('/status', verifyToken, async(req, res) => {
    try {
        const user = await authController.getUserStatus(req.user.id);
        res.json({ user });
    } catch (error) {
        res.status(401).json({ user: null });
    }
})

// Check username availability
router.get('/check-username/:username', async (req, res) => {
    try {
        const result = await authController.checkUsername(req.params.username);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
        const result = await authController.refreshToken(req.body.refreshToken);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const result = await authController.logout(req.body.refreshToken);
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