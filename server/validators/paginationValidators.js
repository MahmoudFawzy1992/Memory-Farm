const { query } = require('express-validator');

exports.validateCursorPage = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1..100'),
  query('cursor').optional().isString().withMessage('cursor must be a base64 string'),
];
