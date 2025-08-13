// server/scripts/cleanup-orphaned-memories.js
// Run this script to clean up memories with deleted users

require('dotenv').config();
const mongoose = require('mongoose');
const Memory = require('../models/Memory');
const User = require('../models/User');

const cleanupOrphanedMemories = async () => {
  try {
    console.log('🔍 Starting orphaned memories cleanup...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find all memories
    const memories = await Memory.find({}).populate('userId');
    console.log(`📊 Found ${memories.length} total memories`);

    let orphanedCount = 0;
    const orphanedIds = [];

    // Check each memory for valid user
    for (const memory of memories) {
      if (!memory.userId || !memory.userId._id) {
        orphanedIds.push(memory._id);
        orphanedCount++;
        console.log(`🚫 Orphaned memory found: ${memory._id} - "${memory.text.substring(0, 50)}..."`);
      }
    }

    if (orphanedCount === 0) {
      console.log('✅ No orphaned memories found!');
      return;
    }

    console.log(`\n⚠️  Found ${orphanedCount} orphaned memories`);
    console.log('Options:');
    console.log('1. DELETE orphaned memories (recommended)');
    console.log('2. ASSIGN to a default "Deleted User" account');
    
    // For now, let's just delete them (you can modify this)
    const result = await Memory.deleteMany({ _id: { $in: orphanedIds } });
    console.log(`🗑️  Deleted ${result.deletedCount} orphaned memories`);
    
    console.log('✅ Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the cleanup
cleanupOrphanedMemories();