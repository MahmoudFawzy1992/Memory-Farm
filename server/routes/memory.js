const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const { validateMemory, validateEmotionInput } = require('../validators/memoryValidators');
const { validateMemoryData } = require('../validators/blockContentSchemas');
const { validateFileUploads } = require('../validators/fileValidation'); // Updated import path
const { validateEmotionWithNLP } = require('../utils/contentProcessing');
const {
  toggleVisibility,
  getPublicMemories,
  getMemoryById,
  getCalendarSummary,
  getMemoriesByDate,
  getMoodDistribution,
  getMoodTrend,
} = require('../controllers/memoryController');
const {
  getPublicDistribution,
  getPublicTrend,
} = require('../controllers/publicAnalyticsController');
const { getMyMemoriesPaginated, getPublicMemoriesPaginated } = require('../controllers/memory/listController');
const {
  validateCalendarSummary,
  validateByDate,
  validateMoodDistribution,
  validateMoodTrend,
} = require('../validators/analyticsValidators');
const { validateCursorPage } = require('../validators/paginationValidators');
const { validationResult } = require('express-validator');

// Import security middleware
const { memoryLimiter } = require('../middleware/rateLimiting');
const { sanitizeSearchQuery } = require('../middleware/sanitization');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log validation failures for monitoring
    console.warn(`Memory validation failed:`, {
      ip: req.ip,
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

// Security logging for memory operations
const logMemoryOperation = (req, operation, success = true, details = '') => {
  console.log(`Memory ${operation}:`, {
    userId: req.user?.id,
    ip: req.ip,
    success,
    timestamp: new Date().toISOString(),
    details
  });
};

// Pagination routes (no rate limiting - read operations)
router.get('/paginated', validateCursorPage, handleValidationErrors, getMyMemoriesPaginated);
router.get('/public/paginated', validateCursorPage, handleValidationErrors, getPublicMemoriesPaginated);

// Analytics routes (no rate limiting - read operations)
router.get('/calendar/summary', validateCalendarSummary, handleValidationErrors, getCalendarSummary);
router.get('/calendar/by-date', validateByDate, handleValidationErrors, getMemoriesByDate);
router.get('/analytics/mood-distribution', validateMoodDistribution, handleValidationErrors, getMoodDistribution);
router.get('/analytics/mood-trend', validateMoodTrend, handleValidationErrors, getMoodTrend);

// Public analytics (no rate limiting - read operations)
router.get('/analytics/public/distribution', validateMoodDistribution, handleValidationErrors, getPublicDistribution);
router.get('/analytics/public/trend', validateMoodTrend, handleValidationErrors, getPublicTrend);

// Emotion validation endpoint for autocomplete
router.post('/validate-emotion', 
  validateEmotionInput, 
  handleValidationErrors, 
  async (req, res, next) => {
    try {
      const { emotion } = req.body;
      const validation = validateEmotionWithNLP(emotion);
      
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      res.json({ 
        valid: true, 
        emotion,
        family: validation.family || 'other'
      });
    } catch (error) {
      console.error('Emotion validation error:', error);
      next(error);
    }
  }
);

// Create memory with rate limiting and enhanced security
router.post('/', 
  memoryLimiter, // Rate limit memory creation
  validateFileUploads, // Validate file uploads first
  async (req, res, next) => {
    try {
      logMemoryOperation(req, 'create_attempt', true, `Title: ${req.body.title?.substring(0, 50)}`);
      
      // Validate using Zod schema (includes title and content validation)
      const validation = validateMemoryData(req.body, false);
      if (!validation.valid) {
        logMemoryOperation(req, 'create', false, `Validation failed: ${validation.errors.join(', ')}`);
        return res.status(400).json({ 
          error: validation.errors.join(', '),
          type: 'validation_error'
        });
      }

      // Additional emotion validation with NLP
      if (req.body.emotion) {
        const emotionValidation = validateEmotionWithNLP(req.body.emotion);
        if (!emotionValidation.valid) {
          logMemoryOperation(req, 'create', false, `Invalid emotion: ${req.body.emotion}`);
          return res.status(400).json({ 
            error: emotionValidation.error,
            type: 'emotion_error'
          });
        }
      }

      // Create memory with validated and sanitized data
      const memory = await Memory.create({ 
        ...validation.data, 
        userId: req.user.id 
      });
      
      logMemoryOperation(req, 'create', true, `Memory created: ${memory._id}`);
      res.status(201).json(memory);
    } catch (error) {
      console.error('Memory creation error:', error);
      logMemoryOperation(req, 'create', false, error.message);
      next(error);
    }
  }
);

// Get user's memories (legacy endpoint - no rate limiting, read operation)
router.get('/', async (req, res, next) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (error) {
    console.error('Get memories error:', error);
    next(error);
  }
});

// Public feed (legacy - no rate limiting, read operation)
router.get('/public/all', getPublicMemories);

// Get single memory (no rate limiting - read operation)
router.get('/:id', getMemoryById);

// Update memory with file validation and enhanced security
router.put('/:id', 
  validateFileUploads, // Validate any new file uploads
  async (req, res, next) => {
    try {
      logMemoryOperation(req, 'update_attempt', true, `Memory: ${req.params.id}`);
      
      // Validate using Zod schema
      const validation = validateMemoryData(req.body, true);
      if (!validation.valid) {
        logMemoryOperation(req, 'update', false, `Validation failed: ${validation.errors.join(', ')}`);
        return res.status(400).json({ 
          error: validation.errors.join(', '),
          type: 'validation_error'
        });
      }

      // Additional emotion validation if emotion is being updated
      if (req.body.emotion) {
        const emotionValidation = validateEmotionWithNLP(req.body.emotion);
        if (!emotionValidation.valid) {
          logMemoryOperation(req, 'update', false, `Invalid emotion: ${req.body.emotion}`);
          return res.status(400).json({ 
            error: emotionValidation.error,
            type: 'emotion_error'
          });
        }
      }

      const updated = await Memory.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        validation.data,
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        logMemoryOperation(req, 'update', false, 'Memory not found or unauthorized');
        return res.status(404).json({ error: 'Memory not found or unauthorized' });
      }
      
      logMemoryOperation(req, 'update', true, `Memory updated: ${req.params.id}`);
      res.json(updated);
    } catch (error) {
      console.error('Memory update error:', error);
      logMemoryOperation(req, 'update', false, error.message);
      next(error);
    }
  }
);

// Delete memory
router.delete('/:id', async (req, res, next) => {
  try {
    logMemoryOperation(req, 'delete_attempt', true, `Memory: ${req.params.id}`);
    
    const deleted = await Memory.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!deleted) {
      logMemoryOperation(req, 'delete', false, 'Memory not found or unauthorized');
      return res.status(404).json({ error: 'Memory not found or unauthorized' });
    }
    
    logMemoryOperation(req, 'delete', true, `Memory deleted: ${req.params.id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Memory delete error:', error);
    logMemoryOperation(req, 'delete', false, error.message);
    next(error);
  }
});

// Toggle visibility (no rate limiting needed)
router.patch('/:id/visibility', async (req, res, next) => {
  try {
    logMemoryOperation(req, 'visibility_toggle', true, `Memory: ${req.params.id}`);
    await toggleVisibility(req, res);
  } catch (error) {
    logMemoryOperation(req, 'visibility_toggle', false, error.message);
    next(error);
  }
});

// Search memories endpoint with enhanced security
router.get('/search/query', async (req, res, next) => {
  try {
    const { q, emotion, limit = 20 } = req.query;
    
    // Sanitize search query to prevent injection
    const sanitizedQuery = sanitizeSearchQuery(q);
    
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    logMemoryOperation(req, 'search', true, `Query: ${sanitizedQuery.substring(0, 50)}`);
    
    const query = { userId: req.user.id };
    
    // Add text search
    if (sanitizedQuery) {
      query.$text = { $search: sanitizedQuery };
    }
    
    // Add emotion filter
    if (emotion && emotion !== 'all') {
      const sanitizedEmotion = sanitizeSearchQuery(emotion);
      query.emotion = new RegExp(sanitizedEmotion, 'i');
    }
    
    const memories = await Memory.find(query)
      .select('title content emotion color memoryDate extractedText isPublic createdAt userId')
      .populate('userId', 'displayName')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(Math.min(parseInt(limit), 50)); // Max 50 results
    
    res.json({ 
      query: sanitizedQuery,
      results: memories, 
      count: memories.length 
    });
  } catch (error) {
    console.error('Memory search error:', error);
    logMemoryOperation(req, 'search', false, error.message);
    next(error);
  }
});

module.exports = router;