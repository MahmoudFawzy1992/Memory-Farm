const { body } = require('express-validator');

// ✅ Signup validation
exports.validateSignup = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .not()
    .isIn(['123456', 'password', 'qwerty'])
    .withMessage('Password is too common'),

  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ max: 30 })
    .withMessage('Display name is too long'),
];

// ✅ Login validation
exports.validateLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];
