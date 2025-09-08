// Defines all available block types, their properties, limits, and validation rules

import { v4 as uuidv4 } from 'uuid';

// Block usage limits for memory creation
export const BLOCK_LIMITS = {
  paragraph: 1,
  checkList: 1,
  image: 3,
  mood: 1,
  divider: 2
};

// Block type definitions with metadata
export const BLOCK_TYPES = {
  paragraph: {
    id: 'paragraph',
    name: 'Text',
    icon: '📝',
    description: 'Add rich text with formatting',
    category: 'text',
    maxUses: BLOCK_LIMITS.paragraph,
    defaultProps: {
      textAlignment: 'left',
      textColor: '#000000',
      backgroundColor: 'transparent'
    }
  },
  checkList: {
    id: 'checkList',
    name: 'Todo List',
    icon: '✅',
    description: 'Track tasks and mark them complete',
    category: 'list',
    maxUses: BLOCK_LIMITS.checkList,
    defaultProps: {
      textColor: '#000000'
    }
  },
  image: {
    id: 'image',
    name: 'Images',
    icon: '🖼️',
    description: 'Add one or more images',
    category: 'media',
    maxUses: BLOCK_LIMITS.image,
    defaultProps: {
      alt: '',
      caption: '',
      width: null
    }
  },
  mood: {
    id: 'mood',
    name: 'Mood Tracker',
    icon: '🎭',
    description: 'Track emotion with intensity',
    category: 'special',
    maxUses: BLOCK_LIMITS.mood,
    defaultProps: {
      emotion: '',
      intensity: 5,
      color: '#8B5CF6',
      note: ''
    }
  },
  divider: {
    id: 'divider',
    name: 'Divider',
    icon: '➖',
    description: 'Add visual separation',
    category: 'layout',
    maxUses: BLOCK_LIMITS.divider,
    defaultProps: {
      style: 'line',
      color: '#E5E7EB'
    }
  }
};

// Create a new block instance with unique ID
export const createBlock = (blockType, initialContent = []) => {
  const blockDef = BLOCK_TYPES[blockType];
  if (!blockDef) {
    throw new Error(`Unknown block type: ${blockType}`);
  }

  return {
    id: uuidv4(),
    type: blockType,
    props: { ...blockDef.defaultProps },
    content: initialContent,
  };
};

// Validate block content based on type
export const validateBlock = (block) => {
  const errors = [];
  
  if (!block.id || !block.type) {
    errors.push('Block must have id and type');
    return { valid: false, errors };
  }

  const blockDef = BLOCK_TYPES[block.type];
  if (!blockDef) {
    errors.push(`Invalid block type: ${block.type}`);
    return { valid: false, errors };
  }

  // Validate content based on block type
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      if (!Array.isArray(block.content) || block.content.length === 0) {
        errors.push('Text blocks must have content');
      }
      break;
      
    case 'image':
      if (!block.props?.images || !Array.isArray(block.props.images) || block.props.images.length === 0) {
        errors.push('Image blocks must have at least one image');
      }
      break;
      
    case 'mood':
      if (!block.props?.emotion) {
        errors.push('Mood blocks must have an emotion selected');
      }
      if (block.props?.intensity < 1 || block.props?.intensity > 10) {
        errors.push('Mood intensity must be between 1 and 10');
      }
      break;
  }

  return { valid: errors.length === 0, errors };
};

// Check if a block type can be added (within limits)
export const canAddBlockType = (blockType, existingBlocks) => {
  const blockDef = BLOCK_TYPES[blockType];
  if (!blockDef) return false;

  const currentCount = existingBlocks.filter(block => block.type === blockType).length;
  return currentCount < blockDef.maxUses;
};

// Get available block types that can still be added
export const getAvailableBlockTypes = (existingBlocks) => {
  return Object.values(BLOCK_TYPES).filter(blockDef => 
    canAddBlockType(blockDef.id, existingBlocks)
  );
};

// Group blocks by category for UI organization
export const getBlocksByCategory = (availableBlocks) => {
  const categories = {
    text: [],
    list: [],
    media: [],
    special: [],
    layout: []
  };

  availableBlocks.forEach(block => {
    if (categories[block.category]) {
      categories[block.category].push(block);
    }
  });

  return categories;
};