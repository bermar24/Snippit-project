const jwt = require('jsonwebtoken');

// Generate JWT Token
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = this.generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// Verify token
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
