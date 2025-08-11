const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    emotion: { type: String, trim: true },
    color: { type: String, default: 'purple-500' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    // The actual date of the event (not the DB insert time)
    memoryDate: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

// Query performance for calendar/analytics
memorySchema.index({ userId: 1, memoryDate: 1 });
memorySchema.index({ userId: 1, isPublic: 1, memoryDate: 1 });
memorySchema.index({ userId: 1, emotion: 1, memoryDate: 1 });

module.exports = mongoose.model('Memory', memorySchema);
