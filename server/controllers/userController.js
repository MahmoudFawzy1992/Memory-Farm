const mongoose = require("mongoose");
const User = require('../models/User');
const Memory = require('../models/Memory');
const bcrypt = require("bcryptjs");

// ✅ Update display name, password, and full profile fields
exports.updateUser = async (req, res) => {
  const {
    displayName,
    password,
    bio,
    location,
    isPrivate,
    showFollowList,
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

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
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ✅ Delete user and their memories
exports.deleteUser = async (req, res) => {
  try {
    await Memory.deleteMany({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie('token');
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// ✅ Public profile with shared memories
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "displayName bio location isPrivate showFollowList followers"
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userId = new mongoose.Types.ObjectId(req.params.id);

    const memories = await Memory.find({
      userId: userId,
      isPublic: true,
    }).sort({ createdAt: -1 });

    console.log("🧠 Public memories found:", memories.length);

    res.json({ user, memories });
  } catch (err) {
    console.error("Public profile fetch error:", err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ✅ Follow user
exports.followUser = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ error: 'User not found' });
    if (me.following.includes(target._id)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    me.following.push(target._id);
    target.followers.push(me._id);

    await me.save();
    await target.save();

    res.json({ message: 'User followed' });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

// ✅ Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ error: 'User not found' });

    me.following = me.following.filter(id => id.toString() !== target._id.toString());
    target.followers = target.followers.filter(id => id.toString() !== me._id.toString());

    await me.save();
    await target.save();

    res.json({ message: 'User unfollowed' });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

// ✅ Get followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'displayName');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ followers: user.followers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
};

// ✅ Get following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'displayName');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ following: user.following });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following' });
  }
};
