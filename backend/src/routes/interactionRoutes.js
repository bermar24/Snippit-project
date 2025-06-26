const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTrendingPosts,
  getRecommendations,
  getPopularTags,
  getPostAnalytics,
  reportContent
} = require('../controllers/interactionController');
const { protect } = require('../middleware/authController');

// Public routes
router.get('/trending', getTrendingPosts);
router.get('/tags/popular', getPopularTags);

// Protected routes
router.use(protect);

router.get('/recommendations', getRecommendations);
router.get('/analytics/post/:id', getPostAnalytics);
router.post('/report', [
  body('contentType').isIn(['post', 'comment']).withMessage('Invalid content type'),
  body('contentId').isMongoId().withMessage('Valid content ID required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('description').optional().isString()
], reportContent);

module.exports = router;
