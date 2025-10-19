const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    bio: String,
    location: String,
    isPrivate: {
      type: Boolean,
      default: false,
    },
    showFollowList: {
      type: Boolean,
      default: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Email verification
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Onboarding & Tutorial System
    onboardingStatus: {
      isCompleted: {
        type: Boolean,
        default: false
      },
      tutorialCompleted: {
        type: Boolean,
        default: false
      },
      welcomeShown: {
        type: Boolean,
        default: false
      },
      completedSteps: {
        type: [String],
        default: []
      },
      completedAt: Date,
      skippedAt: Date
    },

    // Insights Preferences & Tracking
    insightsPreferences: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['every_memory', 'every_5', 'every_10', 'milestones_only'],
        default: 'every_5'
      },
      lastNotificationAt: Date,
      notificationCount: {
        type: Number,
        default: 0
      }
    },

    // AI Usage Tracking 
    // AI Usage Tracking
aiUsageTracking: {
  totalAIInsights: {
    type: Number,
    default: 0
  },
  gpt4oInsights: {
    type: Number,
    default: 0
  },
  llamaInsights: {
    type: Number,
    default: 0
  },
  staticInsights: {
    type: Number,
    default: 0
  },
  lastModelUsed: {
    type: String,
    enum: ['gpt-4o-mini', 'llama-3.2', 'static', null],
    default: null
  },
  lastAIInsightAt: Date,
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  totalCostIncurred: {
    type: Number,
    default: 0
  },
  
  // NEW: Monthly regeneration tracking
  monthlyRegenerations: {
    count: {
      type: Number,
      default: 0
    },
    month: {
      type: String, // Format: "YYYY-MM"
      default: () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
    },
    lastResetAt: {
      type: Date,
      default: Date.now
    }
  }
},
    // Pattern Analysis Cache
    patternCache: {
      lastCalculatedAt: Date,
      totalMemories: {
        type: Number,
        default: 0
      },
      dominantEmotion: String,
      averageWordCount: {
        type: Number,
        default: 0
      },
      emotionDiversity: {
        type: Number,
        default: 0
      },
      currentStreak: {
        type: Number,
        default: 0
      },
      longestStreak: {
        type: Number,
        default: 0
      },
      happiestDay: String,
      contentComplexityAvg: {
        type: Number,
        default: 0
      }
    }
  },
  { 
    timestamps: true,
    collection: 'users'
  }
)

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'onboardingStatus.isCompleted': 1 });
userSchema.index({ 'insightsPreferences.enabled': 1 });
userSchema.index({ 'patternCache.lastCalculatedAt': 1 });
userSchema.index({ 'aiUsageTracking.lastAIInsightAt': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Check if user should receive insights
userSchema.methods.shouldReceiveInsight = function(memoryCount) {
  if (!this.insightsPreferences.enabled) return false;
  
  const frequency = this.insightsPreferences.frequency;
  
  switch (frequency) {
    case 'every_memory':
      return true;
    case 'every_5':
      return memoryCount === 1 || memoryCount % 5 === 0;
    case 'every_10':
      return memoryCount === 1 || memoryCount % 10 === 0;
    case 'milestones_only':
      return [1, 5, 10, 15, 25, 50, 100, 200, 500].includes(memoryCount);
    default:
      return memoryCount === 1 || memoryCount % 5 === 0;
  }
}

// Mark onboarding step as completed
userSchema.methods.completeOnboardingStep = function(stepName) {
  if (!this.onboardingStatus.completedSteps.includes(stepName)) {
    this.onboardingStatus.completedSteps.push(stepName);
  }
  return this.save();
}

// Check if user has completed specific onboarding step
userSchema.methods.hasCompletedStep = function(stepName) {
  return this.onboardingStatus.completedSteps.includes(stepName);
}

// Update pattern cache efficiently
userSchema.methods.updatePatternCache = function(patternData) {
  this.patternCache = {
    ...this.patternCache,
    ...patternData,
    lastCalculatedAt: new Date()
  };
  return this.save();
}

// NEW: Track AI usage
userSchema.methods.trackAIUsage = function(model, tokensUsed = 0, cost = 0) {
  this.aiUsageTracking.totalAIInsights += 1;
  this.aiUsageTracking.lastModelUsed = model;
  this.aiUsageTracking.lastAIInsightAt = new Date();
  
  if (model === 'gpt-4o-mini') {
    this.aiUsageTracking.gpt4oInsights += 1;
    this.aiUsageTracking.totalTokensUsed += tokensUsed;
    this.aiUsageTracking.totalCostIncurred += cost;
  } else if (model === 'llama-3.2') {
    this.aiUsageTracking.llamaInsights += 1;
  } else if (model === 'static') {
    this.aiUsageTracking.staticInsights += 1;
  }
  
  return this.save();
}

// NEW: Track regeneration usage
userSchema.methods.trackRegeneration = function() {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  // Reset if it's a new month
  if (this.aiUsageTracking.monthlyRegenerations.month !== currentMonth) {
    this.aiUsageTracking.monthlyRegenerations = {
      count: 1,
      month: currentMonth,
      lastResetAt: new Date()
    };
  } else {
    this.aiUsageTracking.monthlyRegenerations.count += 1;
  }
  
  return this.save();
};

// NEW: Check if user can regenerate
userSchema.methods.canRegenerateThisMonth = function() {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  // Auto-reset if new month
  if (this.aiUsageTracking.monthlyRegenerations.month !== currentMonth) {
    return true; // New month, they can regenerate
  }
  
  return this.aiUsageTracking.monthlyRegenerations.count < 3;
};

// NEW: Get remaining regenerations for this month
userSchema.methods.getRemainingRegenerations = function() {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  // Auto-reset if new month
  if (this.aiUsageTracking.monthlyRegenerations.month !== currentMonth) {
    return 3;
  }
  
  return Math.max(0, 3 - this.aiUsageTracking.monthlyRegenerations.count);
};

module.exports = mongoose.model('User', userSchema)