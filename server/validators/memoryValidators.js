const { body } = require('express-validator');

// Create or update a memory
exports.validateMemory = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Memory text is required'),

  body('emotion')
    .optional()
    .isString()
    .withMessage('Emotion must be a string'),

  body('color')
    .optional()
    .matches(/^(\w+-\d{3})$/)
    .withMessage('Color format must be like purple-500'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be true or false'),

  body('memoryDate')
    .notEmpty()
    .withMessage('Memory date is required')
    .isISO8601()
    .withMessage('Memory date must be a valid date in YYYY-MM-DD format')
    .toDate() // ✅ converts to JS Date object for Mongoose
];
