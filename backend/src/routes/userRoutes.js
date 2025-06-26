const express = require('express');
const router = express.Router();
const {
  getUser,
  getUserStats,
  toggleFollow,
  getFollowers,
  getFollowing,
  toggleBookmark,
  getBookmarks,
  uploadAvatar,
  searchUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authController');
const { uploadAvatar: upload } = require('../config/cloudinary');

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.use(protect); // All routes below this require authentication

router.get('/:id/stats', getUserStats);
router.put('/follow/:id', toggleFollow);
router.put('/bookmark/:postId', toggleBookmark);
router.get('/bookmarks', getBookmarks);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
