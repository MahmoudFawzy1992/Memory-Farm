const { body } = require('express-validator');
const { validateBlockContent } = require('./blockContentSchemas');

// Custom validator for block content
const validateBlocks = (value) => {
  const result = validateBlockContent(value);
  if (!result.valid) {
    throw new Error(`Invalid content structure: ${result.errors.join(', ')}`);
  }
  return true;
};

// Create or update a memory with block content
exports.validateMemory = [
  body('content')
    .isArray({ min: 1 })
    .withMessage('Content must be an array with at least one block')
    .custom(validateBlocks),

  body('emotion')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Emotion must be 1-100 characters')
    .trim(),

  body('color')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be valid hex code (#RRGGBB)'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be true or false'),

  body('memoryDate')
    .notEmpty()
    .withMessage('Memory date is required')
    .isISO8601()
    .withMessage('Memory date must be valid ISO date')
    .toDate()
];

// Validate emotion text separately for autocomplete/suggestions
exports.validateEmotionInput = [
  body('emotion')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Emotion must be 1-50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Emotion can only contain letters, spaces, hyphens, and apostrophes')
];