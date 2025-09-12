const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { ipKeyGenerator } = require('express-rate-limit'); // ✅ import helper

// Strict auth rate limiting - prevents brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // ✅ default keyGenerator already uses ipKeyGenerator
});

// Signup rate limiting - prevents spam accounts
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signups per hour per IP
  message: {
    error: 'Account creation limit reached. Please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ default keyGenerator (IPv6 safe)
});

// Password reset limiting
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: {
    error: 'Password reset limit reached. Please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // ✅ use email if available, otherwise fallback to IPv6-safe key
    return req.body?.email || ipKeyGenerator(req);
  }
});

// Memory creation limiting - prevents spam
const memoryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 memories per hour
  message: {
    error: 'Memory creation limit reached. Please slow down.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // ✅ prefer userId if logged in, else IPv6-safe IP
    return req.user?.id || ipKeyGenerator(req);
  }
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: {
    error: 'API rate limit exceeded. Please slow down.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || ipKeyGenerator(req); // ✅ safe fallback
  }
});

// Speed limiter for suspicious activity
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests at full speed
  delayMs: () => 500, // 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Max 20s delay
  validate: { delayMs: false } // Disable warning
});

module.exports = {
  authLimiter,
  signupLimiter,
  passwordResetLimiter,
  memoryLimiter,
  apiLimiter,
  speedLimiter
};
