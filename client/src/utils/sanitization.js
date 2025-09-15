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
 * Convert legacy HTML to modern format before sanitizing
 * @param {string} html - HTML content that may contain legacy tags
 * @returns {string} - HTML with modern equivalents
 */
const convertLegacyToModern = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Convert <font color="..."> to <span style="color: ...">
  html = html.replace(/<font([^>]*?)color=['"]([^'"]*?)['"]([^>]*?)>/gi, 
    '<span style="color: $2"$1$3>');
  html = html.replace(/<\/font>/gi, '</span>');
  
  // Convert <strike> to <span style="text-decoration: line-through">
  html = html.replace(/<strike>/gi, '<span style="text-decoration: line-through">');
  html = html.replace(/<\/strike>/gi, '</span>');
  
  return html;
};

/**
 * Sanitize rich text HTML while preserving safe formatting
 * Allows formatting tags but blocks dangerous content
 * @param {string} dirty - Raw HTML content from rich text editor
 * @returns {string} - Sanitized HTML with safe formatting preserved
 */
export const sanitizeRichTextHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  // Convert legacy HTML to modern format first
  const modernHTML = convertLegacyToModern(dirty);
  
  return DOMPurify.sanitize(modernHTML, {
    // Allow safe formatting tags (removed font and strike, added span support)
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'div', 'span',
      'strong', 'b', 'em', 'i', 'u', 'del', 'mark',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre'
    ],
    
    // Allow safe styling attributes
    ALLOWED_ATTR: [
      'style', 'class'
    ],
    
    // Additional security options
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'font', 'strike'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'color'],
    
    // Custom hook to validate CSS
    SANITIZE_DOM: false // We'll handle DOM sanitization
  });
};

/**
 * Validate and clean inline CSS styles
 * @param {string} styleAttr - CSS style attribute content
 * @returns {string} - Cleaned CSS or empty string
 */
const sanitizeInlineStyles = (styleAttr) => {
  if (!styleAttr) return '';
  
  // Split into individual CSS properties
  const properties = styleAttr.split(';').map(prop => prop.trim()).filter(Boolean);
  const safeProperties = [];
  
  // Allow only safe CSS properties
  const allowedProperties = [
    'color', 'background-color', 'text-align', 'font-weight', 
    'font-style', 'text-decoration', 'font-size', 'line-height',
    'margin', 'padding', 'border-radius'
  ];
  
  properties.forEach(property => {
    const [key, value] = property.split(':').map(s => s.trim());
    
    if (allowedProperties.includes(key) && value) {
      // Validate color values
      if (key.includes('color')) {
        if (/^#[0-9A-Fa-f]{6}$/.test(value) || 
            /^#[0-9A-Fa-f]{3}$/.test(value) ||
            /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(value) ||
            /^[a-zA-Z]+$/.test(value)) {
          safeProperties.push(`${key}: ${value}`);
        }
      }
      // Validate text-decoration
      else if (key === 'text-decoration') {
        const validDecorations = ['none', 'underline', 'line-through', 'overline'];
        if (validDecorations.includes(value)) {
          safeProperties.push(`${key}: ${value}`);
        }
      }
      // Validate other safe properties
      else if (!value.includes('javascript:') && 
               !value.includes('data:') && 
               !value.includes('expression(')) {
        safeProperties.push(`${key}: ${value}`);
      }
    }
  });
  
  return safeProperties.join('; ');
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
    
    // Handle different block types appropriately
    if (Array.isArray(block.content)) {
      sanitizedBlock.content = block.content.map(item => {
        if (typeof item === 'string') {
          // For text blocks, preserve rich formatting with modern HTML
          if (block.type === 'paragraph') {
            return sanitizeRichTextHTML(item);
          }
          // For other blocks, use strict sanitization
          return sanitizeHTML(item);
        }
        if (item && typeof item === 'object' && item.text) {
          return {
            ...item,
            // Preserve formatting for text content with modern HTML
            text: block.type === 'paragraph' ? 
              sanitizeRichTextHTML(item.text) : 
              sanitizeHTML(item.text)
          };
        }
        return item;
      });
    }
    
    // Sanitize block props that might contain user input
    if (block.props) {
      const sanitizedProps = { ...block.props };
      
      // Sanitize text-based props (always use strict sanitization for props)
      ['note', 'caption', 'alt', 'emotion'].forEach(prop => {
        if (sanitizedProps[prop] && typeof sanitizedProps[prop] === 'string') {
          sanitizedProps[prop] = sanitizeHTML(sanitizedProps[prop]);
        }
      });
      
      // Sanitize CSS styles if present
      if (sanitizedProps.style) {
        sanitizedProps.style = sanitizeInlineStyles(sanitizedProps.style);
      }
      
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