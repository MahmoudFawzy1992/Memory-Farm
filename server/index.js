require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const memoryRoutes = require('./routes/memory');
const userRoutes = require('./routes/user');
const reportRoutes = require('./routes/report');
const requireAuth = require('./middleware/requireAuth');

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sparkly-eclair-0244cb.netlify.app',
    'https://memory-farm-production.up.railway.app',
  ],
  credentials: true,
}));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/memory', requireAuth, memoryRoutes);
app.use('/api/user', requireAuth, userRoutes);
app.use('/api/report', requireAuth, reportRoutes);

// Start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 4000}`);
    });
  })
  .catch(err => console.error("❌ DB connection error:", err));
