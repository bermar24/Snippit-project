const Post = require('../models/post');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const { getPublicIdFromUrl, deleteImage } = require('../config/cloudinary');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      author,
      search,
      status = 'published',
      sortBy = '-publishedAt'
    } = req.query;

    // Build query
    const query = {};
    
    // Only show published posts to non-authenticated users
    if (!req.user) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (author) query.author = author;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('author', 'name avatarUrl')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total documents
    const count = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:slug
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name avatarUrl bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatarUrl'
        }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only show draft posts to the author
    if (post.status === 'draft' && (!req.user || !post.author._id.equals(req.user._id))) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    await post.incrementViews();

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/id/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatarUrl bio')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name avatarUrl' }
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Only allow draft access to author
    if (post.status === 'draft' && (!req.user || !post.author._id.equals(req.user._id))) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add user to req.body
    req.body.author = req.user._id;

    const post = await Post.create(req.body);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (!post.author.equals(req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Remove fields that shouldn't be updated
    delete req.body.author;
    delete req.body.likes;
    delete req.body.views;

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (!post.author.equals(req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete featured image from Cloudinary if exists
    if (post.featuredImage) {
      const publicId = getPublicIdFromUrl(post.featuredImage);
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userIndex = post.likes.indexOf(req.user._id);
    
    if (userIndex === -1) {
      // Like the post
      post.likes.push(req.user._id);
    } else {
      // Unlike the post
      post.likes.splice(userIndex, 1);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: userIndex === -1,
      likeCount: post.likes.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload featured image
// @route   POST /api/posts/:id/image
// @access  Private
exports.uploadFeaturedImage = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (!post.author.equals(req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Delete old image if exists
    if (post.featuredImage) {
      const publicId = getPublicIdFromUrl(post.featuredImage);
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    post.featuredImage = req.file.path;
    await post.save();

    res.status(200).json({
      success: true,
      featuredImage: post.featuredImage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getPostsByUser = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { author: req.params.userId };
    
    // Only show published posts unless it's the author
    if (!req.user || req.user._id.toString() !== req.params.userId) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    const posts = await Post.find(query)
      .populate('author', 'name avatarUrl')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      data: posts
    });
  } catch (err) {
    next(err);
  }
};
