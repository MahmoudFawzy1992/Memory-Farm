import { ALLOWED_FILE_TYPES, VALIDATION_PATTERNS, FILE_LIMITS } from '../../../../constants/imageValidationConstants';

/**
 * Validates an image file for security and format compliance
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!ALLOWED_FILE_TYPES[file.type]) {
    errors.push(`File type ${file.type} is not allowed. Use JPG, PNG, WebP, or GIF.`);
  }
  
  const config = ALLOWED_FILE_TYPES[file.type];
  if (config && file.size > config.maxSize) {
    errors.push(`File size (${Math.round(file.size / 1024)}KB) exceeds limit (${Math.round(config.maxSize / 1024)}KB)`);
  }
  
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.split('.').pop();
  
  if (config && !config.extensions.includes(fileExt)) {
    errors.push(`File extension .${fileExt} doesn't match file type`);
  }
  
  if (fileName.length > FILE_LIMITS.maxFilenameLength) {
    errors.push('Filename is too long');
  }
  
  if (VALIDATION_PATTERNS.suspicious.some(pattern => pattern.test(fileName))) {
    errors.push('Filename contains suspicious content');
  }
  
  return { valid: errors.length === 0, errors };
};