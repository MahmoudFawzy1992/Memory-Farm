import zxcvbn from 'zxcvbn';

// Common weak passwords to check against
const WEAK_PASSWORDS = [
  'password', '123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
  'superman', 'batman', 'facebook', 'instagram', 'google',
  'iloveyou', 'princess', 'sunshine', 'shadow', 'michael',
  'computer', 'football', 'baseball', 'basketball', 'soccer'
];

// Keyboard patterns to detect
const KEYBOARD_PATTERNS = [
  /^(.)\1{2,}$/, // Repeated characters (aaa, 111)
  /^(012|123|234|345|456|567|678|789|890)+/, // Sequential numbers
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i, // Sequential letters
  /^(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)+/i // Keyboard patterns
];

/**
 * Validate password strength with detailed feedback
 * @param {string} password - Password to validate
 * @param {Object} userInfo - User information to check against
 * @returns {Object} Validation result with detailed feedback
 */
export const validatePasswordStrength = (password, userInfo = {}) => {
  const errors = [];
  const warnings = [];
  const { email = '', displayName = '' } = userInfo;

  // Basic validation
  if (!password || typeof password !== 'string') {
    return { 
      valid: false, 
      score: 0,
      errors: ['Password is required'],
      warnings: [],
      suggestions: []
    };
  }

  // Length requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  // Character requirements
  const requirements = {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  };

  if (!requirements.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  if (!requirements.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  if (!requirements.hasNumbers) {
    errors.push('Password must contain at least one number (0-9)');
  }
  if (!requirements.hasSpecialChars) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  // Check against common weak passwords
  const lowercasePassword = password.toLowerCase();
  if (WEAK_PASSWORDS.some(weak => lowercasePassword.includes(weak))) {
    errors.push('Password contains common words or patterns');
  }

  // Check keyboard patterns
  if (KEYBOARD_PATTERNS.some(pattern => pattern.test(password))) {
    errors.push('Avoid keyboard patterns like "qwerty" or "123456"');
  }

  // Check if password contains user information
  if (email) {
    const emailName = email.split('@')[0].toLowerCase();
    if (emailName.length > 2 && lowercasePassword.includes(emailName)) {
      errors.push('Password should not contain parts of your email address');
    }
  }

  if (displayName && displayName.length > 2) {
    const nameParts = displayName.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length > 2 && lowercasePassword.includes(part)) {
        errors.push('Password should not contain parts of your name');
      }
    }
  }

  // Use zxcvbn for advanced analysis
  const analysis = zxcvbn(password, [
    email,
    displayName,
    email?.split('@')[0],
    ...displayName?.split(/\s+/) || []
  ]);

  // Add zxcvbn feedback
  if (analysis.feedback.warning) {
    warnings.push(analysis.feedback.warning);
  }

  // Require minimum score of 3 for strong passwords
  if (analysis.score < 3 && errors.length === 0) {
    warnings.push('Password could be stronger');
  }

  return {
    valid: errors.length === 0,
    score: analysis.score,
    errors,
    warnings,
    suggestions: analysis.feedback.suggestions || [],
    crackTime: analysis.crack_times_display?.offline_slow_hashing_1e4_per_second || 'unknown',
    entropy: analysis.entropy
  };
};

/**
 * Get password strength for UI display
 * @param {string} password - Password to analyze
 * @param {Object} userInfo - User information context
 * @returns {Object} UI-friendly strength information
 */
export const getPasswordStrengthUI = (password, userInfo = {}) => {
  if (!password) {
    return {
      score: 0,
      label: 'Enter a password',
      color: '#e5e7eb',
      percentage: 0,
      showRequirements: true
    };
  }

  const validation = validatePasswordStrength(password, userInfo);
  const analysis = zxcvbn(password);

  const strengthLevels = [
    { label: 'Very Weak', color: '#ef4444', bgColor: '#fef2f2' },
    { label: 'Weak', color: '#f97316', bgColor: '#fff7ed' },
    { label: 'Fair', color: '#eab308', bgColor: '#fefce8' },
    { label: 'Good', color: '#22c55e', bgColor: '#f0fdf4' },
    { label: 'Strong', color: '#059669', bgColor: '#ecfdf5' }
  ];

  const level = strengthLevels[validation.score] || strengthLevels[0];

  return {
    score: validation.score,
    label: level.label,
    color: level.color,
    bgColor: level.bgColor,
    percentage: Math.max(10, (validation.score + 1) * 20),
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    suggestions: validation.suggestions,
    crackTime: validation.crackTime,
    showRequirements: validation.score < 3,
    requirements: {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
    }
  };
};

/**
 * Check if password meets minimum requirements for submission
 * @param {string} password - Password to check
 * @param {Object} userInfo - User information context
 * @returns {boolean} Whether password is acceptable
 */
export const isPasswordAcceptable = (password, userInfo = {}) => {
  const validation = validatePasswordStrength(password, userInfo);
  return validation.valid && validation.score >= 3;
};

/**
 * Generate password suggestions based on common issues
 * @param {string} password - Current password
 * @returns {Array} Array of suggestion strings
 */
export const getPasswordSuggestions = (password) => {
  const suggestions = [];
  
  if (!password) {
    suggestions.push('Create a password with at least 8 characters');
    return suggestions;
  }

  if (password.length < 8) {
    suggestions.push('Add more characters to reach at least 8');
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters (a-z)');
  }

  if (!/\d/.test(password)) {
    suggestions.push('Add numbers (0-9)');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }

  const analysis = zxcvbn(password);
  if (analysis.feedback.suggestions) {
    suggestions.push(...analysis.feedback.suggestions);
  }

  return [...new Set(suggestions)]; // Remove duplicates
};