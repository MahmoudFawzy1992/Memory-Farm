/**
 * Parses inline style string into object
 * @param {string} styleString - CSS style string
 * @returns {Object} - Style object
 */
export const parseStyleString = (styleString) => {
  const styleObj = {};
  
  if (styleString) {
    styleString.split(';').forEach(rule => {
      if (rule.trim()) {
        const [prop, value] = rule.split(':').map(s => s.trim());
        if (prop && value) styleObj[prop] = value;
      }
    });
  }
  
  return styleObj;
};

/**
 * Converts style object back to string
 * @param {Object} styleObj - Style object
 * @returns {string} - CSS style string
 */
export const styleObjectToString = (styleObj) => {
  return Object.entries(styleObj)
    .map(([prop, value]) => `${prop}: ${value}`)
    .join('; ');
};

/**
 * Gets the closest block element from current selection
 * @param {Range} range - Selection range
 * @param {HTMLElement} editorRef - Editor container reference
 * @returns {HTMLElement|null} - Block element or null
 */
export const getClosestBlockElement = (range, editorRef) => {
  let element = range.commonAncestorContainer;
  
  // Find the closest block element (p, h1-h6, etc.)
  while (element && element.nodeType !== Node.ELEMENT_NODE) {
    element = element.parentNode;
  }
  
  while (element && !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV'].includes(element.tagName)) {
    element = element.parentNode;
  }
  
  return (element && element !== editorRef) ? element : null;
};

/**
 * Creates placeholder content HTML
 * @param {string} placeholder - Placeholder text
 * @returns {string} - HTML string for placeholder
 */
export const createPlaceholderHTML = (placeholder) => {
  return `<p style="color: #9CA3AF; font-style: italic;">${placeholder}</p>`;
};

/**
 * Checks if content is placeholder content
 * @param {string} innerHTML - HTML content to check
 * @returns {boolean} - True if content is placeholder
 */
export const isPlaceholderContent = (innerHTML) => {
  return innerHTML.includes('font-style: italic');
};