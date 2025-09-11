const mongoose = require('mongoose');
const { 
  extractTextFromBlocks, 
  hasImageBlocks, 
  getEmotionFamilyKey,
  calculateContentComplexity 
} = require('../utils/contentProcessing');

const memorySchema = new mongoose.Schema(
  {
    // NEW: Memory title field
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

    // Block-based content structure
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'Content must be an array with at least one block'
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
          // Accept hex colors or tailwind classes
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
      required: false // Required only if emotion is provided
    },
    
    blockCount: {
      type: Number,
      default: 0
    },
    
    hasImages: {
      type: Boolean,
      default: false
    },
    
    contentComplexity: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    // Enable text search
    collection: 'memories'
  }
);

// Indexes for performance
memorySchema.index({ userId: 1, memoryDate: -1 });
memorySchema.index({ userId: 1, isPublic: 1, memoryDate: -1 });
memorySchema.index({ userId: 1, emotionFamily: 1, memoryDate: -1 });
memorySchema.index({ isPublic: 1, emotionFamily: 1, memoryDate: -1 });
memorySchema.index({ extractedText: 'text' }, { sparse: true });
memorySchema.index({ title: 'text' }, { sparse: true }); // NEW: Title search index

// Pre-save middleware to extract metadata
memorySchema.pre('save', function(next) {
  console.log('Pre-save middleware running...');
  console.log('this.emotion:', this.emotion);
  console.log('this.isModified("emotion"):', this.isModified('emotion'));
  
  if (this.isModified('content')) {
    this.extractedText = extractTextFromBlocks(this.content);
    this.blockCount = Array.isArray(this.content) ? this.content.length : 0;
    this.hasImages = hasImageBlocks(this.content);
    this.contentComplexity = calculateContentComplexity(this.content);
  }
  
  if (this.isModified('emotion')) {
    const calculatedFamily = getEmotionFamilyKey(this.emotion);
    console.log('Calculated emotion family:', calculatedFamily);
    this.emotionFamily = calculatedFamily || 'joy';
  }
  
  console.log('Final emotionFamily value:', this.emotionFamily);
  next();
});

// Instance methods for analytics
memorySchema.methods.getPreviewText = function(maxLength = 150) {
  return this.extractedText ? 
    this.extractedText.substring(0, maxLength) + (this.extractedText.length > maxLength ? '...' : '') :
    'No text content';
};

memorySchema.methods.getBlockTypes = function() {
  if (!Array.isArray(this.content)) return [];
  return [...new Set(this.content.map(block => block.type))];
};

module.exports = mongoose.model('Memory', memorySchema);