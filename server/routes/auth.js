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
const { validateSignup, validateLogin } = require('../validators/authValidators');
const { validationResult } = require('express-validator');

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Signup
router.post('/signup', validateSignup, handleValidationErrors, signup);

// Login
router.post('/login', validateLogin, handleValidationErrors, login);

// Logout
router.post('/logout', logout);

// Re-send verification email manually
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerified) return res.json({ message: 'Email already verified' });

    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerifyToken = token;
    await user.save();

    const link = `http://localhost:5173/verify-email?token=${token}&id=${user._id}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      html: `<p>Click to verify: <a href="${link}">${link}</a></p>`,
    });

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Confirm email verification
router.post('/verify-email', verifyEmail);

// Forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
    await user.save();

    const link = `http://localhost:5173/reset-password?token=${token}&id=${user._id}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: `<p>Click to reset password: <a href="${link}">${link}</a></p>`,
    });

    res.json({ message: 'Reset email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { id, newPassword } = req.body;

  try {
    const user = await User.findOne({
      _id: id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get current logged-in user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
