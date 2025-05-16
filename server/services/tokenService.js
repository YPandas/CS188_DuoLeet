const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

class TokenService {
    // Generate access token
    static generateAccessToken(user) {
        return jwt.sign(
            { 
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }  // Access token expires in 15 minutes
        );
    }

    // Generate refresh token
    static async generateRefreshToken(user) {
        const token = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const refreshToken = new RefreshToken({
            token,
            user: user.id,
            expiresAt
        });

        await refreshToken.save();
        return token;
    }

    // Verify access token
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid access token');
        }
    }

    // Verify refresh token
    static async verifyRefreshToken(token) {
        const refreshToken = await RefreshToken.findOne({
            token,
            revokedAt: null,
            expiresAt: { $gt: new Date() }
        }).populate('user');

        if (!refreshToken) {
            throw new Error('Invalid refresh token');
        }

        return refreshToken;
    }

    // Revoke refresh token
    static async revokeRefreshToken(token, replacedByToken = null) {
        const refreshToken = await RefreshToken.findOne({ token });
        if (refreshToken) {
            refreshToken.revokedAt = new Date();
            refreshToken.replacedByToken = replacedByToken;
            await refreshToken.save();
        }
    }

    // Revoke all refresh tokens for a user
    static async revokeAllRefreshTokens(userId) {
        await RefreshToken.updateMany(
            { user: userId, revokedAt: null },
            { revokedAt: new Date() }
        );
    }

    // Generate new token pair
    static async generateTokenPair(user) {
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user);
        return { accessToken, refreshToken };
    }

    // Refresh token pair
    static async refreshTokenPair(refreshToken) {
        const token = await this.verifyRefreshToken(refreshToken);
        
        // Generate new token pair
        const newAccessToken = this.generateAccessToken(token.user);
        const newRefreshToken = await this.generateRefreshToken(token.user);

        // Revoke old refresh token
        await this.revokeRefreshToken(refreshToken, newRefreshToken);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }
}

module.exports = TokenService; 