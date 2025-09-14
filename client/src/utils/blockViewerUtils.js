// Block viewing utilities for memory display
import { format } from 'date-fns';
import { getEmotionColor } from './emotionColors';

// Extract readable content summary from block structure
export const extractBlockSummary = (blocks, maxLength = 200) => {
  if (!Array.isArray(blocks)) return '';
  
  const textBlocks = blocks.filter(block => 
    ['paragraph', 'checkList'].includes(block.type)
  );
  
  let summary = '';
  
  for (const block of textBlocks) {
    if (block.type === 'paragraph' && block.content) {
      const text = block.content
        .map(item => typeof item === 'string' ? item : (item.text || ''))
        .join(' ');
      summary += text + ' ';
    } else if (block.type === 'checkList' && block.content) {
      const items = block.content
        .map(item => item.text || '')
        .filter(text => text.trim())
        .slice(0, 3); // Only first 3 items
      if (items.length > 0) {
        summary += items.join(', ') + ' ';
      }
    }
    
    if (summary.length >= maxLength) break;
  }
  
  return summary.trim().substring(0, maxLength) + 
    (summary.length > maxLength ? '...' : '');
};

// Get emotion data from mood blocks
export const extractEmotionFromBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return null;
  
  const moodBlock = blocks.find(block => block.type === 'mood');
  if (!moodBlock?.props) return null;
  
  const emotion = moodBlock.props.emotion || '';
  const intensity = moodBlock.props.intensity || 5;
  const note = moodBlock.props.note || '';
  
  // Extract emoji and text
  const emojiMatch = emotion.match(/^\p{Emoji}+/u);
  const emoji = emojiMatch ? emojiMatch[0] : '';
  const emotionText = emoji ? emotion.slice(emoji.length).trim() : emotion;
  
  return {
    emotion,
    emoji,
    emotionText,
    intensity,
    note,
    color: getEmotionColor(emotion)
  };
};

// Get block type counts for metadata display
export const getBlockTypeCounts = (blocks) => {
  if (!Array.isArray(blocks)) return {};
  
  const counts = {};
  const typeLabels = {
    paragraph: 'Text',
    checkList: 'Todo',
    image: 'Images',
    mood: 'Mood',
    divider: 'Dividers'
  };
  
  blocks.forEach(block => {
    if (block.type && typeLabels[block.type]) {
      const label = typeLabels[block.type];
      counts[label] = (counts[label] || 0) + 1;
    }
  });
  
  return counts;
};

// Calculate reading time based on block content
export const calculateReadingTime = (blocks) => {
  if (!Array.isArray(blocks)) return 1;
  
  let wordCount = 0;
  
  blocks.forEach(block => {
    if (block.type === 'paragraph' && block.content) {
      const text = block.content
        .map(item => typeof item === 'string' ? item : (item.text || ''))
        .join(' ');
      wordCount += text.trim().split(/\s+/).length;
    } else if (block.type === 'checkList' && block.content) {
      block.content.forEach(item => {
        if (item.text) {
          wordCount += item.text.trim().split(/\s+/).length;
        }
      });
    } else if (block.type === 'mood' && block.props?.note) {
      wordCount += block.props.note.trim().split(/\s+/).length;
    }
  });
  
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
};

// Check if memory has specific content types
export const hasContentType = (blocks, type) => {
  if (!Array.isArray(blocks)) return false;
  return blocks.some(block => block.type === type);
};

// Get total image count across all image blocks
export const getTotalImageCount = (blocks) => {
  if (!Array.isArray(blocks)) return 0;
  
  return blocks
    .filter(block => block.type === 'image')
    .reduce((total, block) => {
      return total + (block.props?.images?.length || 0);
    }, 0);
};

// Get completed todo count
export const getTodoStats = (blocks) => {
  if (!Array.isArray(blocks)) return null;
  
  const todoBlocks = blocks.filter(block => block.type === 'checkList');
  if (todoBlocks.length === 0) return null;
  
  let total = 0;
  let completed = 0;
  
  todoBlocks.forEach(block => {
    if (block.content && Array.isArray(block.content)) {
      block.content.forEach(item => {
        total++;
        if (item.checked) completed++;
      });
    }
  });
  
  return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
};

// Format memory display date with fallback
export const formatMemoryDisplayDate = (memory) => {
  try {
    const date = memory.memoryDate || memory.createdAt;
    if (!date) return 'Unknown date';

    const memoryDate = new Date(date);
    // Always show the actual date in d/m/y format
    return format(memoryDate, 'd/M/yyyy');
  } catch {
    return 'Invalid date';
  }
};

// Check if user is memory owner
export const isMemoryOwner = (memory, user) => {
  if (!user || !memory) return false;
  
  return memory.userId === user._id || 
         memory.userId?._id === user._id ||
         memory.author?._id === user._id ||
         memory.author?.id === user._id;
};

// Get author display information
export const getAuthorInfo = (memory, user) => {
  if (!memory) return null;
  
  const isOwner = isMemoryOwner(memory, user);
  const author = memory.author || memory.userId || null;
  
  return {
    isOwner,
    author,
    shouldShowAuthor: !isOwner && author?.displayName && memory.isPublic,
    authorName: author?.displayName || 'Unknown User'
  };
};

// Generate memory metadata for display
export const generateMemoryMetadata = (memory) => {
  if (!memory) return null;
  
  const blocks = memory.content || [];
  const emotion = extractEmotionFromBlocks(blocks);
  const readingTime = calculateReadingTime(blocks);
  const imageCount = getTotalImageCount(blocks);
  const todoStats = getTodoStats(blocks);
  
  return {
    title: memory.title || 'Untitled Memory',
    summary: extractBlockSummary(blocks),
    emotion,
    readingTime,
    imageCount,
    todoStats,
    hasImages: imageCount > 0,
    hasTodos: todoStats !== null,
    hasMood: hasContentType(blocks, 'mood'),
    displayDate: formatMemoryDisplayDate(memory),
    blockCount: blocks.length
  };
};