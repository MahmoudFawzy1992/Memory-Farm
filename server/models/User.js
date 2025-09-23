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
      return memoryCount === 1 || memoryCount % 5 === 0; // Add memory count 1
    case 'every_10':
      return memoryCount === 1 || memoryCount % 10 === 0; // Add memory count 1
    case 'milestones_only':
      return [1, 5, 10, 15, 25, 50, 100, 200, 500].includes(memoryCount);
    default:
      return memoryCount === 1 || memoryCount % 5 === 0; // Add memory count 1
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

module.exports = mongoose.model('User', userSchema)