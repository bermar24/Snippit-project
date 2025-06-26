const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

// @desc    Get trending posts
// @route   GET /api/interactions/trending
// @access  Public
exports.getTrendingPosts = async (req, res, next) => {
  try {
    const { period = 'week', limit = 10 } = req.query;

    // Calculate date range
    const now = new Date();
    let dateFilter = {};
    
    switch (period) {
      case 'day':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 1)) };
        break;
      case 'week':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
    }

    // Get trending posts based on engagement (views + likes + comments)
    const posts = await Post.aggregate([
      {
        $match: {
          status: 'published',
          publishedAt: dateFilter
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments'
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' },
          engagement: {
            $add: [
              '$views',
              { $multiply: [{ $size: '$likes' }, 2] }, // Likes weighted 2x
              { $multiply: [{ $size: '$comments' }, 3] } // Comments weighted 3x
            ]
          }
        }
      },
      {
        $sort: { engagement: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          title: 1,
          slug: 1,
          excerpt: 1,
          featuredImage: 1,
          category: 1,
          tags: 1,
          views: 1,
          likeCount: 1,
          commentCount: 1,
          engagement: 1,
          publishedAt: 1,
          'author._id': 1,
          'author.name': 1,
          'author.avatarUrl': 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      period,
      count: posts.length,
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recommended posts for user
// @route   GET /api/interactions/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;

    // Get user's interests based on their interactions
    const user = await User.findById(userId);
    
    // Get categories and tags from user's liked posts
    const likedPosts = await Post.find({
      likes: userId
    }).select('category tags');

    // Count category and tag frequencies
    const categoryCount = {};
    const tagCount = {};

    likedPosts.forEach(post => {
      if (post.category) {
        categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
      }
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // Get top categories and tags
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Get posts from followed users
    const followedUsers = user.following || [];

    // Build recommendation query
    const query = {
      status: 'published',
      author: { $ne: userId }, // Exclude user's own posts
      _id: { $nin: likedPosts.map(p => p._id) }, // Exclude already liked posts
      $or: [
        { author: { $in: followedUsers } },
        { category: { $in: topCategories } },
        { tags: { $in: topTags } }
      ]
    };

    const recommendations = await Post.find(query)
      .populate('author', 'name avatarUrl')
      .sort('-publishedAt')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      basedOn: {
        categories: topCategories,
        tags: topTags,
        followedAuthors: followedUsers.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular tags
// @route   GET /api/interactions/tags/popular
// @access  Public
exports.getPopularTags = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get engagement analytics for a post
// @route   GET /api/interactions/analytics/post/:id
// @access  Private (Author only)
exports.getPostAnalytics = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this post'
      });
    }

    // Get comment analytics
    const comments = await Comment.find({ post: post._id });
    const totalComments = comments.length;
    const uniqueCommenters = [...new Set(comments.map(c => c.author.toString()))].length;

    // Calculate engagement rate
    const engagementRate = post.views > 0 
      ? ((post.likes.length + totalComments) / post.views * 100).toFixed(2)
      : 0;

    // Daily views for the last 7 days (mock data - in production, you'd track this)
    const dailyViews = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyViews.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10
      });
    }

    res.status(200).json({
      success: true,
      data: {
        postId: post._id,
        title: post.title,
        totalViews: post.views,
        totalLikes: post.likes.length,
        totalComments,
        uniqueCommenters,
        engagementRate: parseFloat(engagementRate),
        readingTime: post.readingTime,
        publishedAt: post.publishedAt,
        dailyViews,
        topReferrers: [
          { source: 'Direct', visits: 45 },
          { source: 'Google', visits: 32 },
          { source: 'Twitter', visits: 18 },
          { source: 'Facebook', visits: 12 }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Report post/comment
// @route   POST /api/interactions/report
// @access  Private
exports.reportContent = async (req, res, next) => {
  try {
    const { contentType, contentId, reason, description } = req.body;

    if (!['post', 'comment'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }

    // Verify content exists
    const Model = contentType === 'post' ? Post : Comment;
    const content = await Model.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: `${contentType} not found`
      });
    }

    // In a real app, you'd save this report to a database
    // For now, we'll just log it
    console.log('Content reported:', {
      contentType,
      contentId,
      reportedBy: req.user._id,
      reason,
      description,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your report. We will review it shortly.'
    });
  } catch (err) {
    next(err);
  }
};
