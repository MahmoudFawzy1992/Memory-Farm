const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const { validateMemory, validateEmotionInput } = require('../validators/memoryValidators');
const { validateMemoryData } = require('../validators/blockContentSchemas');
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

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

// Pagination routes
router.get('/paginated', validateCursorPage, handleValidationErrors, getMyMemoriesPaginated);
router.get('/public/paginated', validateCursorPage, handleValidationErrors, getPublicMemoriesPaginated);

// Analytics routes
router.get('/calendar/summary', validateCalendarSummary, handleValidationErrors, getCalendarSummary);
router.get('/calendar/by-date', validateByDate, handleValidationErrors, getMemoriesByDate);
router.get('/analytics/mood-distribution', validateMoodDistribution, handleValidationErrors, getMoodDistribution);
router.get('/analytics/mood-trend', validateMoodTrend, handleValidationErrors, getMoodTrend);

// Public analytics
router.get('/analytics/public/distribution', validateMoodDistribution, handleValidationErrors, getPublicDistribution);
router.get('/analytics/public/trend', validateMoodTrend, handleValidationErrors, getPublicTrend);

// Emotion validation endpoint for autocomplete
router.post('/validate-emotion', validateEmotionInput, handleValidationErrors, async (req, res) => {
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
    res.status(500).json({ error: 'Emotion validation failed' });
  }
});

// FIXED: Create memory with block content and title support
router.post('/', async (req, res) => {
  try {
    console.log('Received memory creation request:', {
      title: req.body.title,
      hasContent: !!req.body.content,
      contentLength: req.body.content?.length,
      emotion: req.body.emotion,
      color: req.body.color
    });

    // Validate using Zod schema (now includes title)
    const validation = validateMemoryData(req.body, false);
    if (!validation.valid) {
      console.log('Validation failed:', validation.errors);
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    console.log('Validation passed, validated data:', {
      title: validation.data.title,
      hasContent: !!validation.data.content,
      contentLength: validation.data.content?.length
    });

    // Additional emotion validation with NLP
    if (req.body.emotion) {
      const emotionValidation = validateEmotionWithNLP(req.body.emotion);
      if (!emotionValidation.valid) {
        return res.status(400).json({ error: emotionValidation.error });
      }
    }

    // Create memory with validated data (includes title)
    const memory = await Memory.create({ 
      ...validation.data, 
      userId: req.user.id 
    });
    
    console.log('Memory created successfully:', {
      id: memory._id,
      title: memory.title,
      blockCount: memory.blockCount
    });

    res.status(201).json(memory);
  } catch (error) {
    console.error('Memory creation error:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Get user's memories (legacy endpoint)
router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Public feed (legacy)
router.get('/public/all', getPublicMemories);

// Get single memory
router.get('/:id', getMemoryById);

// FIXED: Update memory with title support
router.put('/:id', async (req, res) => {
  try {
    // Validate using Zod schema (now includes title)
    const validation = validateMemoryData(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    // Additional emotion validation if emotion is being updated
    if (req.body.emotion) {
      const emotionValidation = validateEmotionWithNLP(req.body.emotion);
      if (!emotionValidation.valid) {
        return res.status(400).json({ error: emotionValidation.error });
      }
    }

    const updated = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      validation.data,
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'Memory not found' });
    res.json(updated);
  } catch (error) {
    console.error('Memory update error:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete memory
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Memory.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!deleted) return res.status(404).json({ error: 'Memory not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Toggle visibility
router.patch('/:id/visibility', toggleVisibility);

module.exports = router;