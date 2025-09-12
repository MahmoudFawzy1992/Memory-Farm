require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// Import security middleware
const { apiLimiter, speedLimiter } = require('./middleware/rateLimiting');
const { sanitizeRequest } = require('./middleware/sanitization');

// Import routes
const authRoutes = require('./routes/auth');
const memoryRoutes = require('./routes/memory');
const userRoutes = require('./routes/user');
const reportRoutes = require('./routes/report');
const requireAuth = require('./middleware/requireAuth');

const app = express();

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Allow iframe embedding if needed
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Basic middleware
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sparkly-eclair-0244cb.netlify.app',
    'https://memory-farm-production.up.railway.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));

// Security middleware - applied to all routes
app.use(speedLimiter); // Slow down suspicious activity
app.use(apiLimiter); // General API rate limiting
app.use(sanitizeRequest); // Sanitize all inputs

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/memory', requireAuth, memoryRoutes);
app.use('/api/user', requireAuth, userRoutes);
app.use('/api/report', requireAuth, reportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Don't leak sensitive error details in production
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: isDev ? err.message : 'Invalid input data'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      details: isDev ? err.message : 'Please check your request'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: isDev ? err.message : 'This item already exists'
    });
  }
  
  // Default server error
  res.status(err.status || 500).json({
    error: 'Internal server error',
    details: isDev ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🛡️  Security: Helmet enabled, Rate limiting active`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });