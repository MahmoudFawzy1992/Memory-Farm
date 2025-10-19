const Memory = require('../../models/Memory');
const SimpleInsightsService = require('../../services/simpleInsightsService');
const { validateMemoryData } = require('../../validators/blockContentSchemas');
const { validateEmotionWithNLP } = require('../../utils/contentProcessing');
const { extractIdFromSlug } = require('../../utils/slugify');
const { logMemoryOperation } = require('./validation');

/**
 * Memory CRUD Operations
 */

// Create memory with insight generation
const createMemory = async (req, res, next) => {
  try {
    logMemoryOperation(req, 'create_attempt', true, `Title: ${req.body.title?.substring(0, 50)}`);
    
    // Validate using Zod schema
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
    
    // Trigger insight generation after memory creation
    try {
      const memoryCount = await Memory.countDocuments({ userId: req.user.id });
      const insight = await SimpleInsightsService.generateInsightForUser(
        req.user.id,
        memoryCount,
        memory._id
      );
      
      res.status(201).json({
        memory,
        insight: insight || null,
        shouldShowInsight: !!insight,
        memoryCount
      });
    } catch (insightError) {
      console.error('Insight generation failed:', insightError);
      // Don't fail memory creation if insight generation fails
      res.status(201).json({ 
        memory,
        insight: null,
        shouldShowInsight: false,
        memoryCount: await Memory.countDocuments({ userId: req.user.id })
      });
    }

  } catch (error) {
    console.error('Memory creation error:', error);
    logMemoryOperation(req, 'create', false, error.message);
    next(error);
  }
};

// Get user's memories
const getMyMemories = async (req, res, next) => {
  try {
    const memories = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (error) {
    console.error('Get memories error:', error);
    next(error);
  }
};

// Update memory
const updateMemory = async (req, res, next) => {
  try {
    // Extract ID from slug (supports both old and new formats)
    const memoryId = extractIdFromSlug(req.params.id);
    
    logMemoryOperation(req, 'update_attempt', true, `Memory: ${memoryId}`);
    
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
      { _id: memoryId, userId: req.user.id },
      validation.data,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      logMemoryOperation(req, 'update', false, 'Memory not found or unauthorized');
      return res.status(404).json({ error: 'Memory not found or unauthorized' });
    }
    
    logMemoryOperation(req, 'update', true, `Memory updated: ${memoryId}`);
    res.json(updated);
  } catch (error) {
    console.error('Memory update error:', error);
    logMemoryOperation(req, 'update', false, error.message);
    next(error);
  }
};

// Delete memory
const deleteMemory = async (req, res, next) => {
  try {
    // Extract ID from slug (supports both old and new formats)
    const memoryId = extractIdFromSlug(req.params.id);
    
    logMemoryOperation(req, 'delete_attempt', true, `Memory: ${memoryId}`);
    
    const deleted = await Memory.findOneAndDelete({ 
      _id: memoryId,
      userId: req.user.id 
    });
    
    if (!deleted) {
      logMemoryOperation(req, 'delete', false, 'Memory not found or unauthorized');
      return res.status(404).json({ error: 'Memory not found or unauthorized' });
    }
    
    logMemoryOperation(req, 'delete', true, `Memory deleted: ${memoryId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Memory delete error:', error);
    logMemoryOperation(req, 'delete', false, error.message);
    next(error);
  }
};

module.exports = {
  createMemory,
  getMyMemories,
  updateMemory,
  deleteMemory
};