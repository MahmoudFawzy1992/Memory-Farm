const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  updateUser,
  deleteUser,
  getPublicProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/userController');

// ✅ Middleware applied to all user routes
router.use(requireAuth);

// 🔍 Get current user's profile
router.get('/me', async (req, res) => {
  try {
    const user = await require('mongoose').model('User')
      .findById(req.user.id)
      .select('-password -emailVerifyToken -resetPasswordToken -resetPasswordExpires');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ✏️ Update user info
router.put('/update', updateUser);

// ❌ Delete user and their memories
router.delete('/delete', deleteUser);

// 👤 View public profile and shared memories
router.get('/:id', getPublicProfile);

// ➕ Follow a user
router.post('/follow/:id', followUser);

// ➖ Unfollow a user
router.post('/unfollow/:id', unfollowUser);

// 👥 Get followers / following
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
