const express = require('express');
const router = express.Router();
const { validateEmotionInput } = require('../validators/memoryValidators');
const {
  toggleVisibility,
  getPublicMemories,
  getMemoryById,
  getCalendarSummary,
  getMemoriesByDate,
  getMoodDistribution,
  getMemoriesForDateRange,
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

// Import security middleware
const { memoryLimiter, apiLimiter } = require('../middleware/rateLimiting');

// Import split modules
const {
  handleValidationErrors,
  logMemoryOperation,
  validateMemoryImages,
  validateEmotionEndpoint
} = require('./memory/validation');

const {
  createMemory,
  getMyMemories,
  updateMemory,
  deleteMemory
} = require('./memory/memoryOperations');

const {
  searchMemories
} = require('./memory/memoryQueries');

// Pagination routes (no rate limiting - read operations)
router.get('/paginated', validateCursorPage, handleValidationErrors, getMyMemoriesPaginated);
router.get('/public/paginated', validateCursorPage, handleValidationErrors, getPublicMemoriesPaginated);

// Analytics routes (no rate limiting - read operations)
router.get('/calendar/summary', validateCalendarSummary, handleValidationErrors, getCalendarSummary);
router.get('/calendar/by-date', validateByDate, handleValidationErrors, getMemoriesByDate);
router.get('/analytics/mood-distribution', validateMoodDistribution, handleValidationErrors, getMoodDistribution);
router.get('/analytics/mood-trend', validateMoodTrend, handleValidationErrors, getMoodTrend);
router.get('/calendar/date-range', validateCalendarSummary, handleValidationErrors, getMemoriesForDateRange);

// Public analytics (no rate limiting - read operations)
router.get('/analytics/public/distribution', validateMoodDistribution, handleValidationErrors, getPublicDistribution);
router.get('/analytics/public/trend', validateMoodTrend, handleValidationErrors, getPublicTrend);

// Emotion validation endpoint for autocomplete
router.post('/validate-emotion', 
  validateEmotionInput, 
  handleValidationErrors, 
  validateEmotionEndpoint
);

// Create memory with insight generation
router.post('/', 
  memoryLimiter,
  validateMemoryImages,
  createMemory
);

// Get user's memories (legacy endpoint)
router.get('/', getMyMemories);

// Public feed (legacy)
router.get('/public/all', getPublicMemories);

// Get single memory - supports slugs
router.get('/:id', getMemoryById);

// Update memory with rate limiting and image validation
router.put('/:id', 
  apiLimiter,
  validateMemoryImages,
  updateMemory
);

// Delete memory
router.delete('/:id', deleteMemory);

// Toggle visibility
router.patch('/:id/visibility', async (req, res, next) => {
  try {
    logMemoryOperation(req, 'visibility_toggle', true, `Memory: ${req.params.id}`);
    await toggleVisibility(req, res);
  } catch (error) {
    logMemoryOperation(req, 'visibility_toggle', false, error.message);
    next(error);
  }
});

// Search memories endpoint
router.get('/search/query', searchMemories);

module.exports = router;