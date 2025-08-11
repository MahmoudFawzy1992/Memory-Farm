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
const { getUserPublicMemories } = require('../controllers/user/userMemoryController');
const { validateCursorPage } = require('../validators/paginationValidators');
const { validationResult } = require('express-validator');

// ✅ Middleware applied to all user routes
router.use(requireAuth);

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

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

// 🧠 User's public memories (paginated)
router.get('/:id/memories', validateCursorPage, handleValidationErrors, getUserPublicMemories);

// ➕ Follow a user
router.post('/follow/:id', followUser);

// ➖ Unfollow a user
router.post('/unfollow/:id', unfollowUser);

// 👥 Get followers / following
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
