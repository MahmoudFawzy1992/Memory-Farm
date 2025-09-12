const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const {
  signup,
  login,
  logout,
  verifyEmail,
} = require('../controllers/authController');
const sendEmail = require('../utils/email');
const requireAuth = require('../middleware/requireAuth');
const { validateSignup, validateLogin, validatePasswordReset } = require('../validators/authValidators');
const { validationResult } = require('express-validator');

// Import rate limiting middleware
const { 
  authLimiter, 
  signupLimiter, 
  passwordResetLimiter 
} = require('../middleware/rateLimiting');

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sparkly-eclair-0244cb.netlify.app';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log failed validation attempts for monitoring
    console.warn(`Validation failed for ${req.path}:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors: errors.array().map(e => e.msg)
    });
    
    return res.status(400).json({ 
      error: errors.array()[0].msg,
      field: errors.array()[0].path 
    });
  }
  next();
};

// Enhanced security logging
const logAuthAttempt = (req, action, success = false, details = '') => {
  console.log(`Auth ${action}:`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    success,
    timestamp: new Date().toISOString(),
    details
  });
};

// Signup with rate limiting and enhanced validation
router.post('/signup', 
  signupLimiter, 
  validateSignup, 
  handleValidationErrors, 
  async (req, res, next) => {
    logAuthAttempt(req, 'signup_attempt');
    try {
      await signup(req, res);
      logAuthAttempt(req, 'signup', true, `User: ${req.body.email}`);
    } catch (error) {
      logAuthAttempt(req, 'signup', false, error.message);
      next(error);
    }
  }
);

// Login with rate limiting
router.post('/login', 
  authLimiter, 
  validateLogin, 
  handleValidationErrors, 
  async (req, res, next) => {
    logAuthAttempt(req, 'login_attempt', false, `Email: ${req.body.email}`);
    try {
      await login(req, res);
      logAuthAttempt(req, 'login', true, `User: ${req.body.email}`);
    } catch (error) {
      logAuthAttempt(req, 'login', false, `${req.body.email}: ${error.message}`);
      next(error);
    }
  }
);

// Logout (no rate limiting needed for logout)
router.post('/logout', async (req, res, next) => {
  try {
    await logout(req, res);
    logAuthAttempt(req, 'logout', true);
  } catch (error) {
    next(error);
  }
});

// Re-send verification email with rate limiting
router.post('/resend-verification', 
  passwordResetLimiter, // Reuse password reset limiter
  async (req, res, next) => {
    const { email } = req.body;
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      
      // Don't reveal if user exists for security
      if (!user) {
        logAuthAttempt(req, 'resend_verification', false, `Unknown email: ${email}`);
        return res.json({ message: 'If that email exists, verification was sent' });
      }
      
      if (user.emailVerified) {
        return res.json({ message: 'Email already verified' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      user.emailVerifyToken = token;
      await user.save();

      const link = `${FRONTEND_URL}/verify-email?token=${token}&id=${user._id}`;

      await sendEmail({
        to: user.email,
        subject: 'Memory Farm - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B5CF6;">Verify Your Email</h2>
            <p>Click the link below to verify your email address:</p>
            <a href="${link}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Email</a>
            <p>This link expires in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        `,
      });

      logAuthAttempt(req, 'resend_verification', true, `User: ${email}`);
      res.json({ message: 'Verification email sent' });
    } catch (err) {
      console.error('Resend verification error:', err);
      logAuthAttempt(req, 'resend_verification', false, err.message);
      next(err);
    }
  }
);

// Confirm email verification
router.post('/verify-email', async (req, res, next) => {
  try {
    await verifyEmail(req, res);
    logAuthAttempt(req, 'email_verification', true);
  } catch (error) {
    logAuthAttempt(req, 'email_verification', false, error.message);
    next(error);
  }
});

// Forgot password with enhanced security
router.post('/forgot-password', 
  passwordResetLimiter,
  validatePasswordReset,
  handleValidationErrors,
  async (req, res, next) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      
      // Always return success to prevent email enumeration
      const successMessage = 'If that email exists, a reset link was sent';
      
      if (!user) {
        logAuthAttempt(req, 'forgot_password', false, `Unknown email: ${email}`);
        return res.json({ message: successMessage });
      }

      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
      await user.save();

      const link = `${FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;

      await sendEmail({
        to: user.email,
        subject: 'Memory Farm - Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B5CF6;">Reset Your Password</h2>
            <p>You requested a password reset. Click the link below:</p>
            <a href="${link}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
            <p><strong>This link expires in 30 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>For security, this request was made from IP: ${req.ip}</p>
          </div>
        `,
      });

      logAuthAttempt(req, 'forgot_password', true, `User: ${email}`);
      res.json({ message: successMessage });
    } catch (err) {
      console.error('Forgot password error:', err);
      logAuthAttempt(req, 'forgot_password', false, err.message);
      next(err);
    }
  }
);

// Reset password with enhanced validation
router.post('/reset-password/:token', 
  authLimiter, // Prevent brute force on reset tokens
  validatePasswordReset,
  handleValidationErrors,
  async (req, res, next) => {
    const { token } = req.params;
    const { id, newPassword } = req.body;

    try {
      const user = await User.findOne({
        _id: id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        logAuthAttempt(req, 'password_reset', false, 'Invalid/expired token');
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Password will be hashed by User model pre-save hook
      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      logAuthAttempt(req, 'password_reset', true, `User: ${user.email}`);
      res.json({ message: 'Password reset successful' });
    } catch (err) {
      console.error('Password reset error:', err);
      logAuthAttempt(req, 'password_reset', false, err.message);
      next(err);
    }
  }
);

// Get current logged-in user (protected route)
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -emailVerifyToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    next(err);
  }
});

module.exports = router;