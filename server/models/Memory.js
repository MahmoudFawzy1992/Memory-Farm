const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    text: String,
    emotion: String,
    color: {
      type: String,
      default: 'purple-500',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false, // ✅ only public memories are shown to others
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Memory', memorySchema);
