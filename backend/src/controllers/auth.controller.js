import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError, ERROR_CODES } from "../utils/appError.js";
import { sendSuccess, sendError } from "../utils/response.helper.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HTTP_STATUS, MESSAGES } from "../constants/app.constants.js";
import AtomicOperations from "../utils/atomicOperations.js";
import DistributedSessionManager from "../utils/distributedSessionManager.js";
import config from "../config/env.js";

/**
 * JWT token expiration time
 */
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User's database ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET || process.env.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || JWT_EXPIRES_IN
  });
};

/**
 * Controller for handling user authentication
 * Follows Single Responsibility Principle
 */
class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(
        "User already exists with this email",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.USER_EXISTS
      );
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate token and create distributed session
    const token = generateToken(user._id);
    const sessionId = await DistributedSessionManager.createSession(user._id, {
      email: user.email,
      name: user.name,
      role: user.role
    });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      token,
      sessionId
    };

    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    sendSuccess(res, userData, "User registered successfully", HTTP_STATUS.CREATED);
  });

  /**
   * Login existing user (ATOMIC with distributed session)
   * @route POST /api/auth/login
   */
  loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      throw new AppError(
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new AppError(
        "Account temporarily locked due to too many failed attempts",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.ACCOUNT_LOCKED
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Atomic increment of login attempts
      await user.incLoginAttempts();
      throw new AppError(
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // Successful login - atomic token update and create distributed session
    const token = generateToken(user._id);
    await AtomicOperations.updateTokens(user._id, {
      lastLogin: new Date()
    });

    // Create distributed session
    const sessionId = await DistributedSessionManager.createSession(user._id, {
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString()
    });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      token,
      sessionId
    };

    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    sendSuccess(res, userData, "Login successful");
  });

  /**
    * Handle GitHub OAuth callback
    * @route GET /api/auth/github/callback
    */
  githubCallback = asyncHandler(async (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    // Atomic update for last login
    await AtomicOperations.updateTokens(user._id, {
      lastLogin: new Date()
    });

    // Validated Frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth/callback?token=${token}&userId=${user._id}&name=${encodeURIComponent(user.name)}`);
  });

  /**
    * Logout user and destroy distributed session
    * @route POST /api/auth/logout
    */
  logoutUser = asyncHandler(async (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (sessionId) {
      await DistributedSessionManager.deleteSession(sessionId);
    }

    res.clearCookie('sessionId');
    sendSuccess(res, null, "Logout successful");
  });

  /**
   * Get current user profile
   * @route GET /api/auth/profile
   */
  getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      throw new AppError(
        "User not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    sendSuccess(res, user, "Profile retrieved successfully");
  });

  /**
   * Forgot Password - Send reset email
   * @route POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return sendSuccess(res, null, "If the email exists, a reset link has been sent.");
    }

    // Check if user logged in via GitHub (no password)
    if (user.githubId && !user.password) {
      return sendSuccess(res, null, "If the email exists, a reset link has been sent.");
    }

    // Generate crypto token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving to DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (10 minutes)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      const EmailService = (await import('../services/email.service.js')).default;
      await EmailService.sendPasswordResetEmail(user.email, resetToken, user.name);
      sendSuccess(res, null, "Password reset link sent to your email.");
    } catch (error) {
      // Rollback token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError("Failed to send email. Please try again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  });

  /**
   * Reset Password - Validate token and update password
   * @route PUT /api/auth/reset-password/:token
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      throw new AppError("Password must be at least 8 characters", HTTP_STATUS.BAD_REQUEST);
    }

    // Hash the incoming token
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new AppError("Invalid or expired reset token", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_TOKEN);
    }

    // Update password and clear reset fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendSuccess(res, null, "Password has been reset successfully. You can now log in.");
  });
}

export default new AuthController();
