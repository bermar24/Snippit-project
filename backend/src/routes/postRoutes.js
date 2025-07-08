const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  uploadFeaturedImage,
  getPostsByUser,
  getPostById
} = require('../controllers/postController');
const { protect, optionalAuth, authorize } = require('../middleware/authController');
const { uploadPostImage } = require('../config/cloudinary');
const Post = require('../models/post');

// Validation middleware
const validatePost = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Health', 'Entertainment', 'Other'])
    .withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status')
];

// Public routes with optional auth (for like status)
router.get('/', optionalAuth, getPosts);
router.get('/user/:userId', optionalAuth, getPostsByUser);
router.get('/id/:id', optionalAuth, getPostById);
router.get('/:slug', optionalAuth, getPost);

// Protected routes
router.use(protect);

router.post('/', validatePost, createPost);
router.put('/:id', authorize(Post), validatePost, updatePost);
router.delete('/:id', authorize(Post), deletePost);
router.put('/:id/like', toggleLike);
router.post('/:id/image', authorize(Post), uploadPostImage.single('image'), uploadFeaturedImage);

module.exports = router;
