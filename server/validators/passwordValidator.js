const zxcvbn = require('zxcvbn');

// Common weak passwords and patterns
const WEAK_PASSWORDS = [
  'password', '123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
  'superman', 'batman', 'facebook', 'instagram', 'google',
  'iloveyou', 'princess', 'sunshine', 'shadow', 'michael',
  'computer', 'football', 'baseball', 'basketball', 'soccer'
];

// Common keyboard patterns
const KEYBOARD_PATTERNS = [
  /^(.)\1{2,}$/, // Repeated characters (aaa, 111)
  /^(012|123|234|345|456|567|678|789|890)+/, // Sequential numbers
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i, // Sequential letters
  /^(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)+/i // Keyboard patterns
];

/**
 * Validate password strength according to industry best practices
 * @param {string} password - The password to validate
 * @param {Object} userInfo - User information to check against (email, displayName)
 * @returns {Object} Validation result with success/errors
 */
function validatePasswordStrength(password, userInfo = {}) {
  const errors = [];
  const { email = '', displayName = '' } = userInfo;

  // Basic requirements
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  // Minimum length (8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  // Character requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  }

  // Check against common weak passwords
  const lowercasePassword = password.toLowerCase();
  if (WEAK_PASSWORDS.some(weak => lowercasePassword.includes(weak))) {
    errors.push('Password contains common words or patterns');
  }

  // Check keyboard patterns
  if (KEYBOARD_PATTERNS.some(pattern => pattern.test(password))) {
    errors.push('Password contains keyboard patterns or sequences');
  }

  // Check if password contains user information
  if (email) {
    const emailName = email.split('@')[0].toLowerCase();
    if (emailName.length > 2 && lowercasePassword.includes(emailName)) {
      errors.push('Password cannot contain parts of your email address');
    }
  }

  if (displayName && displayName.length > 2) {
    const nameParts = displayName.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length > 2 && lowercasePassword.includes(part)) {
        errors.push('Password cannot contain parts of your name');
      }
    }
  }

  // Use zxcvbn for advanced strength analysis
  const strengthAnalysis = zxcvbn(password, [
    email,
    displayName,
    email?.split('@')[0],
    ...displayName?.split(/\s+/) || []
  ]);

  // Require minimum score of 3 (out of 4) for strong passwords
  if (strengthAnalysis.score < 3) {
    errors.push(`Password is too weak. ${strengthAnalysis.feedback.warning || 'Try a longer password with mixed characters.'}`);
    
    // Add specific suggestions
    if (strengthAnalysis.feedback.suggestions.length > 0) {
      errors.push(...strengthAnalysis.feedback.suggestions);
    }
  }

  // Check for common substitutions (like @ for a, 3 for e)
  const commonSubstitutions = password
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .toLowerCase();

  if (WEAK_PASSWORDS.some(weak => commonSubstitutions.includes(weak))) {
    errors.push('Avoid simple character substitutions in common words');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: strengthAnalysis.score,
    suggestions: strengthAnalysis.feedback.suggestions,
    entropy: strengthAnalysis.entropy
  };
}

/**
 * Get password strength score for frontend display
 * @param {string} password 
 * @returns {Object} Strength information for UI
 */
function getPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'Very Weak', color: '#ef4444' };
  }

  const analysis = zxcvbn(password);
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#059669'];

  return {
    score: analysis.score,
    label: labels[analysis.score],
    color: colors[analysis.score],
    crackTime: analysis.crack_times_display.offline_slow_hashing_1e4_per_second,
    feedback: analysis.feedback
  };
}

module.exports = {
  validatePasswordStrength,
  getPasswordStrength
};