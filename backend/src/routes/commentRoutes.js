const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
  getUserComments
} = require('../controllers/commentController');
const { protect } = require('../middleware/authController');

// Validation middleware
const validateComment = [
  body('content').trim().notEmpty().withMessage('Content is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  body('post').isMongoId().withMessage('Valid post ID is required'),
  body('parentComment').optional().isMongoId().withMessage('Valid parent comment ID required')
];

// Public routes
router.get('/post/:postId', getPostComments);
router.get('/user/:userId', getUserComments);

// Protected routes
router.use(protect);

router.post('/', validateComment, createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.put('/:id/like', toggleLike);

module.exports = router;
