/**
 * Extract pure text content from HTML, removing all tags and styling
 * @param {string} html - HTML content
 * @returns {string} - Plain text only
 */
export const extractPlainText = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Create a temporary DOM element to extract text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content (strips all HTML)
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Calculate pure text statistics from memory blocks
 * @param {string} title - Memory title
 * @param {Array} blocks - Memory content blocks
 * @returns {Object} - Statistics with pure text counts
 */
export const calculatePureTextStats = (title, blocks) => {
  let totalChars = title.trim().length;
  let totalWords = title.trim() ? title.trim().split(/\s+/).length : 0;
  
  if (!Array.isArray(blocks)) {
    return { characters: totalChars, words: totalWords, readingTime: 1 };
  }
  
  blocks.forEach(block => {
    switch (block.type) {
      case 'paragraph':
        if (block.content && Array.isArray(block.content)) {
          const blockText = block.content
            .map(item => {
              if (typeof item === 'string') {
                return extractPlainText(item);
              }
              if (item && typeof item === 'object' && item.text) {
                return extractPlainText(item.text);
              }
              return '';
            })
            .join(' ');
          
          totalChars += blockText.length;
          if (blockText.trim()) {
            totalWords += blockText.trim().split(/\s+/).length;
          }
        }
        break;
        
      case 'checkList':
        if (block.content && Array.isArray(block.content)) {
          block.content.forEach(item => {
            if (item.text) {
              const plainText = extractPlainText(item.text);
              totalChars += plainText.length;
              if (plainText.trim()) {
                totalWords += plainText.trim().split(/\s+/).length;
              }
            }
          });
        }
        break;
        
      case 'mood':
        if (block.props?.note) {
          const plainNote = extractPlainText(block.props.note);
          totalChars += plainNote.length;
          if (plainNote.trim()) {
            totalWords += plainNote.trim().split(/\s+/).length;
          }
        }
        break;
        
      // Images and dividers don't add to text count
    }
  });
  
  // Reading time calculation (225 words per minute average)
  const readingTime = Math.max(1, Math.ceil(totalWords / 225));
  
  return { 
    characters: totalChars, 
    words: totalWords, 
    readingTime
  };
};