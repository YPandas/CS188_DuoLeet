const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const TokenService = require('../services/tokenService');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Check username availability
const checkUsername = async (username) => {
    const user = await User.findOne({ username });
    return { available: !user };
};

// Register new user
const register = async (userData) => {
    const { email, username, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
        throw new Error('User with this email or username already exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    const user = new User({
        email,
        username,
        password,
        verificationToken,
        verificationTokenExpires
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await transporter.sendMail({
        to: email,
        subject: 'Verify your email',
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
        `
    });

    return { message: 'Registration successful. Please check your email to verify your account.' };
};

// Verify email
const verifyEmail = async (token) => {
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate token pair
    const tokens = await TokenService.generateTokenPair(user);

    return { 
        message: 'Email verified successfully',
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

    // Check if user is verified
    if (!user.isVerified) {
        throw new Error('Please verify your email first');
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
    verifyEmail,
    login,
    refreshToken,
    logout,
    updateProfile,
    getProfileStatus
};