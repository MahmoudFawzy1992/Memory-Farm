const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contactController');
const rateLimit = require('express-rate-limit');

// Rate limiter for contact form to prevent spam
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: 'Too many messages sent from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/contact - Send contact form message
router.post('/', contactLimiter, sendContactMessage);

module.exports = router;