require('dotenv').config();
const mongoose = require('mongoose');
const Memory = require('../models/Memory');

(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in .env');
    await mongoose.connect(process.env.MONGO_URI);

    // Backfill: set memoryDate = createdAt where memoryDate is missing
    const result = await Memory.updateMany(
      { $or: [{ memoryDate: { $exists: false } }, { memoryDate: null }] },
      [{ $set: { memoryDate: '$createdAt' } }] // aggregation pipeline update
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Backfill error:', err);
    process.exit(1);
  }
})();
