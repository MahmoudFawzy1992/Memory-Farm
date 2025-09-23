/**
 * Card Generation Utilities
 * Helper functions for memory card creation and sharing
 */

/**
 * Extract shareable data from memory object
 * @param {Object} memory - Memory object from the database
 * @returns {Object} Processed card data
 */
export function extractCardData(memory) {
  if (!memory) {
    throw new Error('Memory object is required');
  }

  // Extract title with length limit
  const title = memory.title && memory.title.length > 80 
    ? memory.title.substring(0, 77) + '...' 
    : memory.title || 'Untitled Memory';

  // Extract emotion data from mood blocks
  let emotion = { text: '', emoji: '', intensity: 5 };
  if (memory.content && Array.isArray(memory.content)) {
    const moodBlock = memory.content.find(block => block.type === 'mood');
    if (moodBlock?.props) {
      const fullEmotion = moodBlock.props.emotion || '';
      const emojiMatch = fullEmotion.match(/^\p{Emoji}+/u);
      emotion = {
        text: emojiMatch ? fullEmotion.slice(emojiMatch[0].length).trim() : fullEmotion,
        emoji: emojiMatch ? emojiMatch[0] : '🎭',
        intensity: moodBlock.props.intensity || 5
      };
    }
  }

  // Extract first image from image blocks
  let firstImage = null;
  if (memory.content && Array.isArray(memory.content)) {
    const imageBlock = memory.content.find(block => 
      block.type === 'image' && 
      block.props?.images && 
      block.props.images.length > 0
    );
    
    if (imageBlock) {
      const image = imageBlock.props.images[0];
      if (image && image.url) {
        firstImage = {
          url: image.url,
          alt: image.alt || '',
          caption: image.caption || ''
        };
      }
    }
  }

  return {
    title,
    emotion,
    image: firstImage,
    color: memory.color || '#8B5CF6',
    isPublic: memory.isPublic,
    memoryId: memory._id,
    authorName: memory.userId?.displayName || memory.author?.displayName || 'Memory Farm User',
    createdAt: memory.createdAt,
    memoryDate: memory.memoryDate
  };
}

/**
 * Validate if memory can be shared
 * @param {Object} memory - Memory object
 * @param {Object} user - Current user object  
 * @returns {Object} Validation result
 */
export function validateMemorySharing(memory, user) {
  const errors = [];
  
  if (!memory) {
    errors.push('Memory not found');
    return { valid: false, errors };
  }

  if (!user) {
    errors.push('User authentication required');
    return { valid: false, errors };
  }

  // Check ownership
  const isOwner = memory.userId === user._id || 
                  memory.userId?._id === user._id ||
                  memory.author?._id === user._id ||
                  memory.author?.id === user._id;

  if (!isOwner) {
    errors.push('You can only share your own memories');
  }

  // Check if memory is public
  if (!memory.isPublic) {
    errors.push('Only public memories can be shared');
  }

  // Check if memory has required content
  if (!memory.title?.trim()) {
    errors.push('Memory must have a title to be shared');
  }

  return {
    valid: errors.length === 0,
    errors,
    isOwner
  };
}

/**
 * Generate share text for social platforms
 * @param {Object} memory - Memory object
 * @returns {Object} Share text variations
 */
export function generateShareText(memory) {
  const title = memory.title || 'My Memory';
  const baseText = `Check out my memory: "${title}"`;
  
  return {
    default: `${baseText} - Shared from Memory Farm`,
    twitter: `${baseText} #MemoryFarm #Journaling`,
    instagram: `${baseText}\n\n#MemoryFarm #PersonalJourney #Memories`,
    facebook: `I just shared a memory from my Memory Farm journal: "${title}". Take a look!`,
    whatsapp: `${baseText} 📝✨`
  };
}

/**
 * Get platform-specific share URL
 * @param {string} platform - Social platform name
 * @param {string} url - Memory URL
 * @param {string} text - Share text
 * @returns {string} Platform-specific share URL
 */
export function getPlatformShareUrl(platform, url, text) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText} ${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=Check out my memory&body=${encodedText} ${encodedUrl}`
  };
  
  return shareUrls[platform] || url;
}

/**
 * Check device capabilities for sharing
 * @returns {Object} Device sharing capabilities
 */
export function getDeviceCapabilities() {
  const hasWebShare = 'share' in navigator;
  const hasClipboard = 'clipboard' in navigator && 'writeText' in navigator.clipboard;
  const canShareFiles = hasWebShare && navigator.canShare && 
    navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] });
  
  return {
    hasWebShare,
    hasClipboard,
    canShareFiles,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent)
  };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Create blob URL from base64 image data
 * @param {string} base64Data - Base64 image data
 * @returns {string} Blob URL
 */
export function createBlobFromBase64(base64Data) {
  try {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 format');
    }
    
    const [, mimeType, base64Content] = matches;
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to create blob from base64:', error);
    return null;
  }
}