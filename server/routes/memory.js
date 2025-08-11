const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
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
const { validateMemory } = require('../validators/memoryValidators');
const {
  validateCalendarSummary,
  validateByDate,
  validateMoodDistribution,
  validateMoodTrend,
} = require('../validators/analyticsValidators');
const { validateCursorPage } = require('../validators/paginationValidators');
const { validationResult } = require('express-validator');
const Memory = require('../models/Memory');

router.use(requireAuth);

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

// Pagination (add these first so they don't clash)
router.get('/paginated', validateCursorPage, handleValidationErrors, getMyMemoriesPaginated);
router.get('/public/paginated', validateCursorPage, handleValidationErrors, getPublicMemoriesPaginated);

// User-scoped calendar + analytics
router.get('/calendar/summary', validateCalendarSummary, handleValidationErrors, getCalendarSummary);
router.get('/calendar/by-date', validateByDate, handleValidationErrors, getMemoriesByDate);
router.get('/analytics/mood-distribution', validateMoodDistribution, handleValidationErrors, getMoodDistribution);
router.get('/analytics/mood-trend', validateMoodTrend, handleValidationErrors, getMoodTrend);

// Public (global) analytics — still behind auth, but only aggregates isPublic:true
router.get('/analytics/public/distribution', validateMoodDistribution, handleValidationErrors, getPublicDistribution);
router.get('/analytics/public/trend', validateMoodTrend, handleValidationErrors, getPublicTrend);

// Create
router.post('/', validateMemory, handleValidationErrors, async (req, res) => {
  try {
    const memory = await Memory.create({ ...req.body, userId: req.user.id });
    res.status(201).json(memory);
  } catch {
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// List mine (legacy full list)
router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(memories);
  } catch {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Public feed (legacy full list)
router.get('/public/all', getPublicMemories);

// Read one (enforces privacy inside controller)
router.get('/:id', getMemoryById);

// Update
router.put('/:id', validateMemory, handleValidationErrors, async (req, res) => {
  try {
    const updated = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Memory not found' });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Memory not found' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Visibility toggle
router.patch('/:id/visibility', toggleVisibility);

module.exports = router;
