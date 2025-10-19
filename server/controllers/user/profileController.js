const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Memory = require("../../models/Memory");
const Insight = require("../../models/Insight");
const Report = require("../../models/Report");

// Update profile (displayName, bio, location, privacy, password)
exports.updateUser = async (req, res) => {
  const { displayName, password, bio, location, isPrivate, showFollowList } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (isPrivate !== undefined) user.isPrivate = isPrivate;
    if (showFollowList !== undefined) user.showFollowList = showFollowList;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        isPrivate: user.isPrivate,
        showFollowList: user.showFollowList,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Delete user and cascade delete all related data
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`🗑️ Starting account deletion for user: ${userId}`);

    // DELETE ALL USER DATA (cascade delete)
    
    // 1. Delete all user's memories
    const memoriesDeleted = await Memory.deleteMany({ userId });
    console.log(`✅ Deleted ${memoriesDeleted.deletedCount} memories`);

    // 2. Delete all user's insights
    const insightsDeleted = await Insight.deleteMany({ userId });
    console.log(`✅ Deleted ${insightsDeleted.deletedCount} insights`);

    // 3. Delete all user's reports
    const reportsDeleted = await Report.deleteMany({ reporterId: userId });
    console.log(`✅ Deleted ${reportsDeleted.deletedCount} reports`);

    // 4. Remove user from other users' followers/following arrays
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    console.log(`✅ Removed user from all follow relationships`);

    // 5. Finally, delete the user account
    await User.findByIdAndDelete(userId);
    console.log(`✅ User account deleted: ${userId}`);

    // Clear auth cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.json({ 
      message: "Account and all data permanently deleted",
      deleted: {
        memories: memoriesDeleted.deletedCount,
        insights: insightsDeleted.deletedCount,
        reports: reportsDeleted.deletedCount
      }
    });

  } catch (err) {
    console.error("❌ Account deletion error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// Public profile + shared memories (respects privacy)
exports.getPublicProfile = async (req, res) => {
  try {
    // ✅ Extract ID from slug (supports both old and new formats)
    const { extractIdFromSlug } = require('../../utils/slugify');
    const userId = extractIdFromSlug(req.params.id);
    
    const user = await User.findById(userId).select(
      "displayName bio location isPrivate showFollowList followers"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    const isOwner = req.user.id === userId;
    if (user.isPrivate && !isOwner) {
      return res.status(403).json({ error: "This account is private" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const memories = await Memory.find({ userId: userObjectId, isPublic: true }).sort({ createdAt: -1 });

    res.json({ user, memories });
  } catch (err) {
    console.error("Public profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};