// server/scripts/cleanup-orphaned-memories.js
// Run this script to clean up memories with deleted users

require('dotenv').config();
const mongoose = require('mongoose');
const Memory = require('../models/Memory');
const User = require('../models/User');

const cleanupOrphanedMemories = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    // Find all memories
    const memories = await Memory.find({}).populate('userId');

    let orphanedCount = 0;
    const orphanedIds = [];

    // Check each memory for valid user
    for (const memory of memories) {
      if (!memory.userId || !memory.userId._id) {
        orphanedIds.push(memory._id);
        orphanedCount++;
      }
    }

    if (orphanedCount === 0) {
      return;
    }

    
    // For now, let's just delete them (you can modify this)
    const result = await Memory.deleteMany({ _id: { $in: orphanedIds } });
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the cleanup
cleanupOrphanedMemories();