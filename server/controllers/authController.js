const User = require('../models/User');
const { createToken } = require('../utils/jwt');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // 🆕 Dynamic based on environment
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 🆕 Dynamic
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.signup = async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.create({ email, password, displayName });

    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerifyToken = token;
    await user.save();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const link = `${frontendUrl}/verify-email?token=${token}&id=${user._id}`;

await sendEmail({
  to: user.email,
  subject: "Verify Your Email",
  html: `<p>Click to verify your email: <a href="${link}">${link}</a></p>`,
});

// ✅ Don't log the user in here — only respond
    res.status(201).json({ message: "Signup successful. Please verify your email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const emailNorm = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    const user = await User.findOne({ email: emailNorm });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = createToken({ id: user._id, email: user.email });

    res
      .cookie('token', token, cookieOptions)
      .status(200)
      .json({
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
        },
      });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Login failed' });
  }
};


exports.logout = (req, res) => {
    res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({ message: 'Logged out' });

};

exports.verifyEmail = async (req, res) => {
  const { token, id } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ error: "Invalid verification link or token" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (user.emailVerifyToken !== token) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};
