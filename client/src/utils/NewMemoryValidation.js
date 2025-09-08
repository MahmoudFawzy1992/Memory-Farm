import { validateBlock } from '../components/block-editor/BlockTypeDefinitions';

// Extract emotion from mood blocks
export const getEmotionFromMoodBlocks = (blocks) => {
  const moodBlocks = blocks.filter(block => block.type === 'mood');
  if (moodBlocks.length > 0 && moodBlocks[0].props?.emotion) {
    return moodBlocks[0].props.emotion;
  }
  return '';
};

// Validate all memory form fields
export const validateMemoryForm = (title, blocks, color, memoryDate) => {
  const newErrors = {};
  
  // Validate title
  if (!title.trim()) {
    newErrors.title = 'Please enter a title for your memory.';
  } else if (title.trim().length < 3) {
    newErrors.title = 'Title must be at least 3 characters long.';
  }
  
  // Validate emotion from mood block
  const emotion = getEmotionFromMoodBlocks(blocks);
  if (!emotion.trim()) {
    newErrors.emotion = 'Please select your emotion in the mood tracker block.';
  }
  
  // Validate color
  if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
    newErrors.color = 'Please select a valid color.';
  }
  
  // Validate date
  if (!memoryDate) {
    newErrors.memoryDate = 'Please select when this memory happened.';
  } else if (memoryDate > new Date()) {
    newErrors.memoryDate = 'Memory date cannot be in the future.';
  }

  // Validate blocks
  blocks.forEach((block, index) => {
    const validation = validateBlock(block);
    if (!validation.valid) {
      newErrors[`block_${index}`] = `Block ${index + 1}: ${validation.errors.join(', ')}`;
    }
  });
  
  return newErrors;
};

// Calculate content statistics
export const calculateContentStats = (title, blocks) => {
  let totalChars = title.length;
  let totalWords = title.trim() ? title.trim().split(/\s+/).length : 0;
  
  blocks.forEach(block => {
    if (block.content && Array.isArray(block.content)) {
      const blockText = block.content
        .map(item => typeof item === 'string' ? item : (item.text || ''))
        .join(' ');
      totalChars += blockText.length;
      if (blockText.trim()) {
        totalWords += blockText.trim().split(/\s+/).length;
      }
    }
  });
  
  return { 
    characters: totalChars, 
    words: totalWords, 
    readingTime: Math.max(1, Math.ceil(totalWords / 200)) 
  };
};