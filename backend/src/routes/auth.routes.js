import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import { validateEmail, validatePassword } from '../middlewares/validation.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.middleware.js';
import { body } from 'express-validator';
import passport from 'passport';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be 2-50 characters long')
      .escape(),
    validateEmail,
    validatePassword
  ],
  AuthController.registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with distributed rate limiting
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter, // Distributed rate limiting
  [validateEmail, body('password').notEmpty().withMessage('Password is required')],
  AuthController.loginUser
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and destroy session
 * @access  Private
 */
router.post('/logout', protect, AuthController.logoutUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, AuthController.getUserProfile);

/**
 * @route   GET /api/auth/github
 * @desc    GitHub OAuth
 * @access  Public
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth Callback
 * @access  Public
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login?error=auth_failed' }),
  AuthController.githubCallback
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  [validateEmail],
  AuthController.forgotPassword
);

/**
 * @route   PUT /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.put(
  '/reset-password/:token',
  [validatePassword],
  AuthController.resetPassword
);

export default router;