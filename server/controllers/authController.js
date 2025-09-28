const User = require('../models/User');
const { createToken } = require('../utils/jwt');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

    // Set httpOnly cookie as primary auth method
    res.cookie('token', token, cookieOptions);

    // Also return token in response body as fallback for incognito mode
    res.status(200).json({
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      },
      // Include token for incognito/localStorage fallback
      token: token,
      // Flag to indicate hybrid auth support
      authMethod: 'hybrid'
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logout = (req, res) => {
  // Clear cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  // Return success - client will handle localStorage cleanup
  res.status(200).json({ 
    message: 'Logged out',
    clearStorage: true // Signal to client to clear localStorage
  });
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