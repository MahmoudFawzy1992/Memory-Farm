const mongoose = require('mongoose');
const { 
  extractTextFromBlocks, 
  hasImageBlocks, 
  getEmotionFamilyKey,
  calculateContentComplexity 
} = require('../utils/contentProcessing');

const memorySchema = new mongoose.Schema(
  {
    // Memory title field
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      validate: {
        validator: function(value) {
          return value && value.trim().length >= 3;
        },
        message: 'Title is required and must be at least 3 characters'
      }
    },

    // Block-based content structure with image support
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function(value) {
          if (!Array.isArray(value) || value.length === 0) {
            return false;
          }
          
          // FIXED: Enhanced validation for image blocks
          for (const block of value) {
            if (block.type === 'image') {
              if (!block.props?.images || !Array.isArray(block.props.images) || block.props.images.length === 0) {
                return false;
              }
              
              // Validate each image has required fields
              for (const image of block.props.images) {
                if (!image.url || !image.url.startsWith('data:image/')) {
                  return false;
                }
                if (!image.id || !image.name) {
                  return false;
                }
              }
            }
          }
          
          return true;
        },
        message: 'Content must be an array with at least one valid block'
      }
    },
        
    // Core metadata
    emotion: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(value) {
          if (!value) return true; // Optional field
          // Remove emoji and validate emotion name
          const cleanEmotion = value.replace(/^\p{Emoji}+/u, '').trim();
          return cleanEmotion.length >= 2 && cleanEmotion.length <= 30;
        },
        message: 'Emotion must be between 2-30 characters'
      }
    },
    
    color: { 
      type: String, 
      required: true,
      validate: {
        validator: function(value) {
          return /^#[0-9A-F]{6}$/i.test(value) || /^(\w+-\d{3})$/.test(value);
        },
        message: 'Color must be hex code (#RRGGBB) or Tailwind class (color-500)'
      }
    },
    
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    
    isPublic: { 
      type: Boolean, 
      default: false 
    },
    
    // The actual date of the memory/event
    memoryDate: { 
      type: Date, 
      required: true, 
      default: () => new Date() 
    },

    // Auto-extracted metadata for search and analytics
    extractedText: {
      type: String,
      index: 'text' // Text search index
    },
    
    emotionFamily: {
      type: String,
      enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'nostalgia', 'love'],
      required: false
    },
    
    blockCount: {
      type: Number,
      default: 0
    },
    
    hasImages: {
      type: Boolean,
      default: false
    },
    
    // FIXED: New field to track image count for analytics
    imageCount: {
      type: Number,
      default: 0
    },
    
    contentComplexity: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    collection: 'memories'
  }
);

// Indexes for performance
memorySchema.index({ userId: 1, memoryDate: -1 });
memorySchema.index({ userId: 1, isPublic: 1, memoryDate: -1 });
memorySchema.index({ userId: 1, emotionFamily: 1, memoryDate: -1 });
memorySchema.index({ isPublic: 1, emotionFamily: 1, memoryDate: -1 });
memorySchema.index({ extractedText: 'text' }, { sparse: true });
memorySchema.index({ title: 'text' }, { sparse: true });
memorySchema.index({ hasImages: 1, isPublic: 1 }); // NEW: Index for image filtering

// FIXED: Enhanced pre-save middleware with image processing
memorySchema.pre('save', function(next) {
  console.log('Pre-save middleware running...');
  
  if (this.isModified('content')) {
    this.extractedText = extractTextFromBlocks(this.content);
    this.blockCount = Array.isArray(this.content) ? this.content.length : 0;
    this.hasImages = hasImageBlocks(this.content);
    this.contentComplexity = calculateContentComplexity(this.content);
    
    // FIXED: Calculate image count
    this.imageCount = 0;
    if (Array.isArray(this.content)) {
      this.content.forEach(block => {
        if (block.type === 'image' && block.props?.images) {
          this.imageCount += block.props.images.length;
        }
      });
    }
    
    console.log('Content processed:', {
      blockCount: this.blockCount,
      hasImages: this.hasImages,
      imageCount: this.imageCount,
      textLength: this.extractedText?.length || 0
    });
  }
  
  if (this.isModified('emotion')) {
    const calculatedFamily = getEmotionFamilyKey(this.emotion);
    console.log('Calculated emotion family:', calculatedFamily);
    this.emotionFamily = calculatedFamily || 'joy';
  }
  
  next();
});

// Enhanced instance methods for analytics
memorySchema.methods.getPreviewText = function(maxLength = 150) {
  return this.extractedText ? 
    this.extractedText.substring(0, maxLength) + (this.extractedText.length > maxLength ? '...' : '') :
    'No text content';
};

memorySchema.methods.getBlockTypes = function() {
  if (!Array.isArray(this.content)) return [];
  return [...new Set(this.content.map(block => block.type))];
};

// FIXED: New method to get image metadata
memorySchema.methods.getImageInfo = function() {
  if (!Array.isArray(this.content)) return { count: 0, totalSize: 0 };
  
  let count = 0;
  let totalSize = 0;
  
  this.content.forEach(block => {
    if (block.type === 'image' && block.props?.images) {
      block.props.images.forEach(image => {
        count++;
        totalSize += image.size || 0;
      });
    }
  });
  
  return { count, totalSize };
};

// FIXED: Method to sanitize sensitive image data for public display
memorySchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  
  // Remove sensitive image metadata for public memories
  if (obj.content && Array.isArray(obj.content)) {
    obj.content = obj.content.map(block => {
      if (block.type === 'image' && block.props?.images) {
        return {
          ...block,
          props: {
            ...block.props,
            images: block.props.images.map(image => ({
              id: image.id,
              url: image.url,
              alt: image.alt || '',
              caption: image.caption || '',
              // Remove potentially sensitive metadata
              // name, size, type, uploadedAt are hidden
            }))
          }
        };
      }
      return block;
    });
  }
  
  return obj;
};

module.exports = mongoose.model('Memory', memorySchema);