import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Strips all HTML tags and returns plain text only
 * @param {string} dirty - Raw user input
 * @returns {string} - Sanitized plain text
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  // Strip ALL HTML tags and return plain text only for maximum security
  return DOMPurify.sanitize(dirty, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false
  }).trim();
};

/**
 * Sanitize text input for forms and user inputs
 * @param {string} input - User input
 * @returns {string} - Sanitized text
 */
export const sanitizeTextInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize memory content blocks to prevent XSS
 * @param {Array} blocks - Memory content blocks
 * @returns {Array} - Sanitized blocks
 */
export const sanitizeMemoryBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return [];
  
  return blocks.map(block => {
    if (!block || typeof block !== 'object') return block;
    
    const sanitizedBlock = { ...block };
    
    // Sanitize text content in blocks
    if (Array.isArray(block.content)) {
      sanitizedBlock.content = block.content.map(item => {
        if (typeof item === 'string') {
          return sanitizeHTML(item);
        }
        if (item && typeof item === 'object' && item.text) {
          return {
            ...item,
            text: sanitizeHTML(item.text)
          };
        }
        return item;
      });
    }
    
    // Sanitize block props that might contain user input
    if (block.props) {
      const sanitizedProps = { ...block.props };
      
      // Sanitize text-based props
      ['note', 'caption', 'alt', 'emotion'].forEach(prop => {
        if (sanitizedProps[prop] && typeof sanitizedProps[prop] === 'string') {
          sanitizedProps[prop] = sanitizeHTML(sanitizedProps[prop]);
        }
      });
      
      sanitizedBlock.props = sanitizedProps;
    }
    
    return sanitizedBlock;
  });
};

/**
 * Sanitize search queries to prevent injection
 * @param {string} query - Search query
 * @returns {string} - Sanitized query
 */
export const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .replace(/[<>{}$]/g, '') // Remove HTML and MongoDB operators
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
    .substring(0, 200); // Limit length to prevent DoS
};

/**
 * Validate and sanitize URL inputs
 * @param {string} url - URL to validate
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Only allow http and https protocols
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Sanitize email addresses
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>{}$]/g, '')
    .substring(0, 254); // RFC email length limit
};

/**
 * Escape special characters for safe display
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (s) => entityMap[s]);
};

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed object or default value
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return defaultValue;
    }
    
    // Basic validation to prevent potential attacks
    if (jsonString.includes('__proto__') || jsonString.includes('constructor')) {
      console.warn('Potentially malicious JSON detected');
      return defaultValue;
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
};

/**
 * Sanitize form data object
 * @param {Object} formData - Form data to sanitize
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  if (!formData || typeof formData !== 'object') return {};
  
  const sanitized = {};
  
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeTextInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeTextInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};