const DOMPurify = require('isomorphic-dompurify');

/**
 * Sanitize HTML content to prevent XSS attacks
 * Completely strips all HTML tags and scripts
 */
function sanitizeHTML(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';
  
  // Strip ALL HTML tags and return plain text only
  return DOMPurify.sanitize(dirty, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true
  }).trim();
}

/**
 * Sanitize memory content blocks recursively
 */
function sanitizeMemoryContent(content) {
  if (!Array.isArray(content)) return [];
  
  return content.map(block => {
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
}

/**
 * Express middleware to sanitize request body
 */
function sanitizeRequest(req, res, next) {
  if (req.body) {
    // Sanitize common text fields
    ['title', 'text', 'displayName', 'bio', 'location', 'emotion', 'reason'].forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHTML(req.body[field]);
      }
    });
    
    // Sanitize memory content if present
    if (req.body.content) {
      req.body.content = sanitizeMemoryContent(req.body.content);
    }
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHTML(req.query[key]);
      }
    });
  }
  
  next();
}

/**
 * Validate and sanitize search queries to prevent injection
 */
function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') return '';
  
  // Remove potential MongoDB operators
  const cleaned = query
    .replace(/[\$\{\}]/g, '') // Remove MongoDB operators
    .replace(/[<>]/g, '') // Remove comparison operators
    .trim();
  
  return sanitizeHTML(cleaned);
}

/**
 * Sanitize file upload metadata
 */
function sanitizeFileData(fileData) {
  if (!fileData || typeof fileData !== 'object') return fileData;
  
  return {
    ...fileData,
    name: fileData.name ? sanitizeHTML(fileData.name) : '',
    alt: fileData.alt ? sanitizeHTML(fileData.alt) : '',
    caption: fileData.caption ? sanitizeHTML(fileData.caption) : ''
  };
}

module.exports = {
  sanitizeHTML,
  sanitizeMemoryContent,
  sanitizeRequest,
  sanitizeSearchQuery,
  sanitizeFileData
};