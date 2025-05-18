const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const TokenService = require('../services/tokenService');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD  // Using App Password instead of regular password
    }
});

// Check username availability
const checkUsername = async (username) => {
    const user = await User.findOne({ username });
    return { available: !user };
};

// Register new user
const register = async (userData) => {
    const { email, username, password, onboarding } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
        throw new Error('User with this email or username already exists');
    }

    // Map frontend onboarding data to match MongoDB schema
    const onBoardingInfo = {
        school: onboarding?.organization || '',
        goal: {
            daily: onboarding?.plan?.daily || null,
            weekly: onboarding?.plan?.weekly || null,
            monthly: onboarding?.plan?.monthly || null
        },
        peers: onboarding?.peers || []
    };

    // Create new user
    const user = new User({
        email,
        username,
        password,
        onBoardingInfo
    });

    await user.save();

    // Generate token pair
    const tokens = await TokenService.generateTokenPair(user);

    return { 
        message: 'Registration successful',
        ...tokens
    };
};

// Login
const login = async (credentials) => {
    const { email, password } = credentials;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Generate token pair
    const tokens = await TokenService.generateTokenPair(user);

    return tokens;
};

// Refresh token
const refreshToken = async (refreshToken) => {
    return await TokenService.refreshTokenPair(refreshToken);
};

// Logout
const logout = async (refreshToken) => {
    await TokenService.revokeRefreshToken(refreshToken);
    return { message: 'Logged out successfully' };
};

// Update profile
const updateProfile = async (userId, updates) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    await user.updateProfile(updates);
    return { 
        message: 'Profile updated successfully',
        profileCompleted: user.profileCompleted
    };
};

// Get profile status
const getProfileStatus = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    return {
        profileCompleted: user.profileCompleted,
        lastUpdate: user.lastProfileUpdate,
        onBoardingInfo: user.onBoardingInfo
    };
};

module.exports = {
    checkUsername,
    register,
    login,
    refreshToken,
    logout,
    updateProfile,
    getProfileStatus
};