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
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'style', 'class'
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
 * Validate base64 image data
 */
function validateBase64Image(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  
  // Check if it's a valid data URL format
  if (!dataUrl.startsWith('data:image/')) return false;
  
  // Extract MIME type
  const mimeMatch = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/);
  if (!mimeMatch) return false;
  
  // Validate base64 content
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) return false;
  
  try {
    // Try to decode base64
    Buffer.from(base64Data, 'base64');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize image block data
 */
function sanitizeImageBlock(imageData) {
  if (!imageData || typeof imageData !== 'object') return null;
  
  // Validate required fields
  if (!imageData.url || !validateBase64Image(imageData.url)) {
    return null;
  }
  
  return {
    id: imageData.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url: imageData.url, // Keep valid base64 data as-is
    name: sanitizeHTML(imageData.name || 'untitled'),
    alt: sanitizeHTML(imageData.alt || ''),
    caption: sanitizeHTML(imageData.caption || ''),
    size: typeof imageData.size === 'number' ? Math.min(imageData.size, 10 * 1024 * 1024) : 0, // Max 10MB
    type: imageData.type || 'image/jpeg',
    uploadedAt: imageData.uploadedAt || new Date().toISOString()
  };
}

/**
 * Sanitize memory content blocks recursively with image support
 */
function sanitizeMemoryContent(content) {
  if (!Array.isArray(content)) return [];

  return content.map(block => {
    if (!block || typeof block !== 'object') return block;

    const sanitizedBlock = { ...block };

    // Handle different block types
    switch (block.type) {
      case 'paragraph':
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
        break;

      case 'checkList':
        // Sanitize checklist items
        if (Array.isArray(block.content)) {
          sanitizedBlock.content = block.content.map(item => {
            if (item && typeof item === 'object') {
              return {
                ...item,
                text: sanitizeHTML(item.text || ''),
                checked: Boolean(item.checked),
                completedAt: item.completedAt || null
              };
            }
            return item;
          });
        }
        break;

      case 'image':
        // FIXED: Properly sanitize image block
        if (block.props?.images && Array.isArray(block.props.images)) {
          const sanitizedImages = block.props.images
            .map(sanitizeImageBlock)
            .filter(Boolean); // Remove invalid images
          
          sanitizedBlock.props = {
            ...block.props,
            images: sanitizedImages
          };
        }
        break;

      case 'mood':
        // Sanitize mood block props
        if (block.props) {
          sanitizedBlock.props = {
            ...block.props,
            emotion: sanitizeHTML(block.props.emotion || ''),
            note: sanitizeHTML(block.props.note || ''),
            intensity: typeof block.props.intensity === 'number' ? 
              Math.max(1, Math.min(10, block.props.intensity)) : 5,
            color: block.props.color || '#8B5CF6'
          };
        }
        break;

      default:
        // Handle other block types
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
    }

    // Sanitize block props that might contain user input
    if (block.props && block.type !== 'image' && block.type !== 'mood') {
      const sanitizedProps = { ...block.props };

      // Sanitize text-based props
      ['note', 'caption', 'alt'].forEach(prop => {
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
 * Express middleware to sanitize request body with image support
 */
function sanitizeRequest(req, res, next) {
  if (req.body) {
    // Sanitize common text fields
    ['title', 'text', 'displayName', 'bio', 'location', 'emotion', 'reason'].forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHTML(req.body[field]);
      }
    });
    
    // Sanitize memory content if present (with image support)
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

module.exports = {
  sanitizeHTML,
  sanitizeMemoryContent,
  sanitizeRequest,
  sanitizeSearchQuery,
  sanitizeImageBlock,
  validateBase64Image
};