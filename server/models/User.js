const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot be more than 30 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and dashes']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    googleId: String,
    isVerified: {
        type: Boolean,
        default: true  // Always verified by default now
    },
    onBoardingInfo: {
        reason: String,
        goal: {
            daily: {
                type: Number,
                min: [0, 'Daily goal cannot be negative']
            },
            weekly: {
                type: Number,
                min: [0, 'Weekly goal cannot be negative']
            },
            monthly: {
                type: Number,
                min: [0, 'Monthly goal cannot be negative']
            }
        },
        school: {
            type: String
        },
        peers: {
            type: [String]
        }
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    lastProfileUpdate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
UserSchema.pre('save', async function(next) { //mongoose pre save hook, runs before saving user doc
    if (!this.isModified('password')) return next(); //if password is not modified, skip hashing
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to check if profile is complete
UserSchema.methods.isProfileComplete = function() {
    // Basic profile requirements
    const hasBasicInfo = this.onBoardingInfo.reason && this.onBoardingInfo.school;
    
    // Check if any goal is set (not required, but if set must be valid)
    const goals = this.onBoardingInfo.goal || {};
    const hasValidGoals = true; // Goals are now optional
    
    return hasBasicInfo && hasValidGoals;
};

// Method to update profile
UserSchema.methods.updateProfile = async function(updates) {
    const allowedUpdates = ['reason', 'goal', 'school', 'peers'];
    const updatedFields = {};

    for (const field of allowedUpdates) {
        if (updates[field]) {
            if (field === 'goal') {
                updatedFields['onBoardingInfo.goal'] = {
                    ...this.onBoardingInfo.goal,
                    ...updates.goal
                };
            } else {
                updatedFields[`onBoardingInfo.${field}`] = updates[field];
            }
        }
    }

    updatedFields.lastProfileUpdate = Date.now();
    updatedFields.profileCompleted = this.isProfileComplete();

    return this.updateOne({ $set: updatedFields });
};

module.exports = mongoose.model("User", UserSchema);