// client/src/components/MemoryCard/utils.js
import { format } from "date-fns";

// Block type icons for footer
export const BLOCK_ICONS = {
  paragraph: '📝', 
  checkList: '✅', 
  image: '🖼️', 
  divider: '➖', 
  heading: '📰'
};

// Extract title from memory structure
export const extractTitle = (memory) => {
  if (memory.title) {
    return memory.title.length > 60 ? memory.title.substring(0, 60) + '...' : memory.title;
  }
  // Fallback for legacy memories
  const text = memory.previewText || memory.extractedText || '';
  const firstLine = text.split('\n')[0].trim();
  return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine || 'Untitled Memory';
};

// Extract content preview
export const extractPreview = (memory, truncateLength) => {
  const text = memory.previewText || memory.extractedText || '';
  if (truncateLength && text.length > truncateLength * 6) {
    return text.substring(0, truncateLength * 6) + '...';
  }
  return text;
};

// Extract emotion and intensity from blocks
export const extractEmotionData = (memory) => {
  if (memory.content && Array.isArray(memory.content)) {
    const moodBlock = memory.content.find(block => block.type === 'mood');
    if (moodBlock?.props) {
      return {
        emotion: moodBlock.props.emotion || '',
        intensity: moodBlock.props.intensity || 5
      };
    }
  }
  return { emotion: memory.emotion || '', intensity: 5 };
};

// FIXED: Proper owner detection (matching ViewMemory.jsx logic)
export const determineOwnership = (memory, user) => {
  if (!user || !memory) return { isOwner: false, authorObj: null, shouldShowAuthor: false };
  
  // Extract author object (same logic as ViewMemory)
  const authorObj = memory.author || memory.userId || null;
  
  // Check ownership (same logic as ViewMemory useMemoryViewer)
  const isOwner = user && memory && 
    (memory.userId === user._id || memory.userId?._id === user._id ||
     (authorObj && (authorObj._id === user._id || authorObj.id === user._id)));
  
  // Show author info for public memories from other users
  const shouldShowAuthor = authorObj?.displayName && !isOwner && memory.isPublic;
  
  return { isOwner, authorObj, shouldShowAuthor };
};

// Format display date
export const formatDisplayDate = (memory) => {
  const d = memory.memoryDate || memory.createdAt;
  try {
    return d ? format(new Date(d), "MMM d, yyyy") : null;
  } catch {
    return null;
  }
};

// Extract block indicators
export const extractBlockIndicators = (memory) => {
  const types = new Set();
  
  if (memory.content && Array.isArray(memory.content)) {
    memory.content.forEach(block => {
      if (block.type !== 'mood' && BLOCK_ICONS[block.type]) {
        types.add(block.type);
      }
    });
  }
  
  // Fallback to legacy flags
  if (memory.hasImages) types.add('image');
  if (memory.hasChecklistItems) types.add('checkList');
  if (memory.hasHeadings) types.add('heading');
  
  return Array.from(types).slice(0, 4);
};