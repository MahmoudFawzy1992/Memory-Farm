const DOMPurify = require('isomorphic-dompurify');

/**
 * Sanitize HTML content to prevent XSS attacks
 * Completely strips all HTML tags and scripts
 */
function sanitizeHTML(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  // Allow safe rich text HTML tags and attributes for memory content
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'div', 'span',
      'strong', 'b', 'em', 'i', 'u', 'del', 'mark',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a'
    ],
    ALLOWED_ATTR: [
      'style', 'class',
      'href', 'target', 'rel'
    ],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmouseenter', 'onmouseleave']
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

    // Sanitize text content in blocks allowing rich text HTML
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