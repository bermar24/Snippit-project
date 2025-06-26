const Comment = require('../models/comment');
const Post = require('../models/post');
const { validationResult } = require('express-validator');

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
exports.getPostComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get all comments for the post with nested replies
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name avatarUrl')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name avatarUrl'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content, post, parentComment } = req.body;

    // Verify post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if comments are enabled
    if (!postExists.commentsEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Comments are disabled for this post'
      });
    }

    // If it's a reply, verify parent comment exists
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }

      // Ensure parent comment belongs to the same post
      if (!parentExists.post.equals(post)) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to this post'
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author: req.user._id,
      post,
      parentComment
    });

    await comment.populate('author', 'name avatarUrl');

    // TODO: Send notification to post author or parent comment author

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = content;
    await comment.save();

    await comment.populate('author', 'name avatarUrl');

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership (post author can also delete comments)
    const post = await Post.findById(comment.post);
    const isAuthor = comment.author.equals(req.user._id);
    const isPostAuthor = post && post.author.equals(req.user._id);

    if (!isAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete the comment
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like/Unlike comment
// @route   PUT /api/comments/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userIndex = comment.likes.indexOf(req.user._id);

    if (userIndex === -1) {
      // Like the comment
      comment.likes.push(req.user._id);
    } else {
      // Unlike the comment
      comment.likes.splice(userIndex, 1);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      liked: userIndex === -1,
      likeCount: comment.likes.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user comments
// @route   GET /api/comments/user/:userId
// @access  Public
exports.getUserComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({ author: req.params.userId })
      .populate('post', 'title slug')
      .populate('author', 'name avatarUrl')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Comment.countDocuments({ author: req.params.userId });

    res.status(200).json({
      success: true,
      count: comments.length,
      total: count,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      data: comments
    });
  } catch (err) {
    next(err);
  }
};
