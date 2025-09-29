const express = require('express');
const router = express.Router();
const { generateMemoryCard } = require('../controllers/shareController');
const { validationResult } = require('express-validator');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// FIXED: Rate limiting for card generation - 3 cards per day per user
const cardGenerationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 3, // 3 cards per day per user
  message: {
    error: 'Card generation limit reached. You can create 3 cards per day.',
    retryAfter: 24 * 60 * 60,
    limitType: 'card_generation'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use userId when available
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    // ✅ Safe IPv6-compatible fallback
    return ipKeyGenerator(req);
  },
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(`Share validation failed:`, {
      userId: req.user?.id,
      errors: errors.array().map(e => e.msg),
      path: req.path
    });
    
    return res.status(400).json({ 
      error: errors.array()[0].msg,
      field: errors.array()[0].path 
    });
  }
  next();
};

// Logging middleware for share operations
const logShareOperation = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`Share operation:`, {
      userId: req.user?.id,
      memoryId: req.params.memoryId,
      success: res.statusCode < 400,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

// Generate memory card image
router.post('/card/:memoryId', 
  cardGenerationLimiter,
  logShareOperation,
  generateMemoryCard
);

// Health check for sharing service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'memory_sharing',
    limits: {
      cardsPerHour: 3,
      maxImageSize: '1MB'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
