const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Memory = require("../../models/Memory");

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

// Delete user and their memories
exports.deleteUser = async (req, res) => {
  try {
    await Memory.deleteMany({ userId: req.user.id }); // fixed: field is userId
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token");
    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// Public profile + shared memories (respects privacy)
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "displayName bio location isPrivate showFollowList followers"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    const isOwner = req.user.id === req.params.id;
    if (user.isPrivate && !isOwner) {
      return res.status(403).json({ error: "This account is private" });
    }

    const userId = new mongoose.Types.ObjectId(req.params.id);
    const memories = await Memory.find({ userId, isPublic: true }).sort({ createdAt: -1 });

    res.json({ user, memories });
  } catch (err) {
    console.error("Public profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
