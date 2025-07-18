const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Token is invalid, but we don't fail the request
      req.user = null;
    }
  }

  next();
};

// Check if user owns the resource
exports.authorize = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    // Check ownership
    if (resource.author && !resource.author.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this resource' 
      });
    }

    req.resource = resource;
    next();
  } catch (err) {
    next(err);
  }
};
