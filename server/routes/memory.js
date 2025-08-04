const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  toggleVisibility,
  getPublicMemories,
  getMemoryById, // ✅ NEW
} = require('../controllers/memoryController');
const { validateMemory } = require('../validators/memoryValidators');
const { validationResult } = require('express-validator');
const Memory = require('../models/Memory');

// Protect all memory routes
router.use(requireAuth);

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Create new memory
router.post('/', validateMemory, handleValidationErrors, async (req, res) => {
  try {
    const memory = await Memory.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(memory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Get all memories for current user
router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// ✅ Get a single memory (handles private/public access)
router.get('/:id', getMemoryById);

// Update memory
router.put('/:id', validateMemory, handleValidationErrors, async (req, res) => {
  try {
    const updated = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Memory not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete memory
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Memory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: 'Memory not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Toggle visibility
router.patch('/:id/visibility', toggleVisibility);

// Public feed
router.get('/public/all', getPublicMemories);

module.exports = router;
