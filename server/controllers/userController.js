const { updateUser, deleteUser, getPublicProfile } = require("./user/profileController");
const { followUser, unfollowUser, getFollowers, getFollowing } = require("./user/followController");

module.exports = {
  updateUser,
  deleteUser,
  getPublicProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
