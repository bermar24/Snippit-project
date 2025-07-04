const User = require('../models/user');
const Follow = require('../models/follow');
const Post = require('../models/post');
const { getPublicIdFromUrl, deleteImage } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name avatarUrl')
      .populate('following', 'name avatarUrl');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get post count
    const postCount = await Post.countDocuments({ 
      author: user._id,
      status: 'published'
    });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        postCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user stats
// @route   GET /api/users/:id/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    // Check if user is requesting their own stats
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these stats'
      });
    }

    const userId = req.params.id;
    const { range = 'week' } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (range) {
      case 'week':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    // Get stats
    const posts = await Post.find({ author: userId });
    const postIds = posts.map(p => p._id);

    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
    
    // Count comments across all posts
    const Comment = require('../models/comment');
    const totalComments = await Comment.countDocuments({ post: { $in: postIds } });

    res.status(200).json({
      success: true,
      data: {
        totalPosts,
        totalViews,
        totalLikes,
        totalComments,
        range
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow/Unfollow user
// @route   PUT /api/users/follow/:id
// @access  Private
exports.toggleFollow = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't follow yourself
    if (req.user._id.equals(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: userToFollow._id
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.deleteOne();
      
      // Update both users
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: userToFollow._id }
      });
      
      await User.findByIdAndUpdate(userToFollow._id, {
        $pull: { followers: req.user._id }
      });

      res.status(200).json({
        success: true,
        following: false,
        message: 'User unfollowed'
      });
    } else {
      // Follow
      await Follow.create({
        follower: req.user._id,
        following: userToFollow._id
      });
      
      // Update both users
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { following: userToFollow._id }
      });
      
      await User.findByIdAndUpdate(userToFollow._id, {
        $addToSet: { followers: req.user._id }
      });

      res.status(200).json({
        success: true,
        following: true,
        message: 'User followed'
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatarUrl bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      data: user.followers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatarUrl bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      data: user.following
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bookmark/Unbookmark post
// @route   PUT /api/users/bookmark/:postId
// @access  Private
exports.toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarkedPosts.includes(post._id);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarkedPosts = user.bookmarkedPosts.filter(
        id => !id.equals(post._id)
      );
    } else {
      // Add bookmark
      user.bookmarkedPosts.push(post._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      bookmarked: !isBookmarked,
      message: isBookmarked ? 'Bookmark removed' : 'Post bookmarked'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookmarked posts
// @route   GET /api/users/bookmarks
// @access  Private
exports.getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'bookmarkedPosts',
        populate: {
          path: 'author',
          select: 'name avatarUrl'
        }
      });

    res.status(200).json({
      success: true,
      count: user.bookmarkedPosts.length,
      data: user.bookmarkedPosts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar if exists and not default
    if (user.avatarUrl && !user.avatarUrl.includes('ui-avatars.com')) {
      const publicId = getPublicIdFromUrl(user.avatarUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    user.avatarUrl = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name avatarUrl bio')
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};
