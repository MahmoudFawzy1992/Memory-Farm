const { body } = require('express-validator');
const { validatePasswordStrength } = require('./passwordValidator'); // Updated import path

// Custom password validator that uses our enhanced password checker
const strongPasswordValidator = async (value, { req }) => {
  if (!value) {
    throw new Error('Password is required');
  }

  const userInfo = {
    email: req.body.email,
    displayName: req.body.displayName
  };

  const validation = validatePasswordStrength(value, userInfo);
  
  if (!validation.valid) {
    // Throw the first error message
    throw new Error(validation.errors[0]);
  }
  
  return true;
};

// Enhanced email validation
const emailValidator = (value) => {
  if (!value) {
    throw new Error('Email is required');
  }
  
  // More strict email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(value)) {
    throw new Error('Please enter a valid email address');
  }
  
  // Prevent overly long emails (DoS protection)
  if (value.length > 254) {
    throw new Error('Email address is too long');
  }
  
  // Block some suspicious patterns
  const suspiciousPatterns = [
    /^[0-9]+@/, // Starting with numbers only
    /\+{2,}/, // Multiple consecutive plus signs
    /\.{2,}/, // Multiple consecutive dots
    /@.*@/, // Multiple @ symbols
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(value))) {
    throw new Error('Invalid email format');
  }
  
  return true;
};

// Enhanced display name validation
const displayNameValidator = (value) => {
  if (!value || !value.trim()) {
    throw new Error('Display name is required');
  }
  
  const trimmed = value.trim();
  
  // Length validation
  if (trimmed.length < 2) {
    throw new Error('Display name must be at least 2 characters');
  }
  
  if (trimmed.length > 50) {
    throw new Error('Display name cannot exceed 50 characters');
  }
  
  // Character validation - allow letters, numbers, spaces, and common symbols
  const validNameRegex = /^[a-zA-Z0-9\s\-_.']+$/;
  if (!validNameRegex.test(trimmed)) {
    throw new Error('Display name contains invalid characters');
  }
  
  // Prevent names that are just numbers or special characters
  if (/^[0-9\-_.'\s]+$/.test(trimmed)) {
    throw new Error('Display name must contain at least one letter');
  }
  
  // Block inappropriate words (basic filter)
  const blockedWords = ['admin', 'root', 'system', 'null', 'undefined'];
  const lowercaseName = trimmed.toLowerCase();
  
  if (blockedWords.some(word => lowercaseName.includes(word))) {
    throw new Error('Display name contains restricted words');
  }
  
  return true;
};

// ✅ Enhanced signup validation
exports.validateSignup = [
  body('email')
    .trim()
    .normalizeEmail()
    .custom(emailValidator),

  body('password')
    .custom(strongPasswordValidator),

  body('displayName')
    .trim()
    .custom(displayNameValidator),
];

// ✅ Enhanced login validation  
exports.validateLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .custom(emailValidator),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password is too long'),
];

// ✅ Password reset validation
exports.validatePasswordReset = [
  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .custom(emailValidator),
    
  body('newPassword')
    .optional()
    .custom(strongPasswordValidator),
    
  body('id')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

// ✅ Email verification validation
exports.validateEmailVerification = [
  body('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid verification token')
    .isAlphanumeric()
    .withMessage('Token contains invalid characters'),
    
  body('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];