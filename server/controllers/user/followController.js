const User = require("../../models/User");

// Follow user
exports.followUser = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ error: "User not found" });
    if (me._id.equals(target._id)) return res.status(400).json({ error: "Cannot follow yourself" });
    if (me.following.includes(target._id)) {
      return res.status(400).json({ error: "Already following this user" });
    }

    me.following.push(target._id);
    target.followers.push(me._id);

    await me.save();
    await target.save();

    res.json({ message: "User followed" });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ error: "Failed to follow user" });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ error: "User not found" });

    me.following = me.following.filter((id) => id.toString() !== target._id.toString());
    target.followers = target.followers.filter((id) => id.toString() !== me._id.toString());

    await me.save();
    await target.save();

    res.json({ message: "User unfollowed" });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};

// Followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "displayName");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ followers: user.followers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch followers" });
  }
};

// Following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "displayName");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ following: user.following });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch following" });
  }
};
