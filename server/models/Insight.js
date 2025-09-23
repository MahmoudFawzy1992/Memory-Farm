const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Insight Classification
    type: {
      type: String,
      enum: [
        'milestone',
        'emotion_pattern', 
        'writing_pattern',
        'streak',
        'diversity',
        'complexity',
        'consistency'
      ],
      required: true
    },

    category: {
      type: String,
      enum: ['achievement', 'discovery', 'encouragement', 'trend'],
      required: true
    },

    // Insight Content
    title: {
      type: String,
      required: true,
      maxlength: 100
    },

    message: {
      type: String,
      required: true,
      maxlength: 500
    },

    // Trigger Context
    triggerMemoryCount: {
      type: Number,
      required: true
    },

    triggerMemoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Memory'
    },

    // Pattern Data Used
    patternData: {
      dominantEmotion: String,
      emotionCount: Number,
      averageWordCount: Number,
      streakDays: Number,
      emotionDiversity: Number,
      contentComplexity: Number,
      happiestDay: String,
      analysisTimeRange: {
        from: Date,
        to: Date
      }
    },

    // Display Properties
    icon: {
      type: String,
      default: '💡'
    },

    color: {
      type: String,
      default: '#8B5CF6'
    },

    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },

    // User Interaction
    isRead: {
      type: Boolean,
      default: false
    },

    readAt: Date,

    isFavorited: {
      type: Boolean,
      default: false
    },

    // Metadata
    isVisible: {
      type: Boolean,
      default: true
    },

    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    collection: 'insights'
  }
);

// Indexes for efficient queries
insightSchema.index({ userId: 1, createdAt: -1 });
insightSchema.index({ userId: 1, isVisible: 1, createdAt: -1 });
insightSchema.index({ userId: 1, type: 1 });
insightSchema.index({ userId: 1, triggerMemoryCount: 1 });
insightSchema.index({ generatedAt: 1 }); // For cleanup tasks

// Instance methods
insightSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

insightSchema.methods.toggleFavorite = function() {
  this.isFavorited = !this.isFavorited;
  return this.save();
};

// Static methods for insight retrieval
insightSchema.statics.getUserInsights = function(userId, options = {}) {
  const query = { 
    userId: new mongoose.Types.ObjectId(userId),
    isVisible: true 
  };
  
  if (options.type) query.type = options.type;
  if (options.category) query.category = options.category;
  if (options.unreadOnly) query.isRead = false;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

insightSchema.statics.getLatestInsight = function(userId) {
  return this.findOne({ 
    userId: new mongoose.Types.ObjectId(userId),
    isVisible: true 
  }).sort({ createdAt: -1 });
};

insightSchema.statics.hasRecentInsight = function(userId, memoryCount) {
  return this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    triggerMemoryCount: memoryCount
  });
};

// Virtual for formatted date
insightSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Transform for JSON output
insightSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Insight', insightSchema);