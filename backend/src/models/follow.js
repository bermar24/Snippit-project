const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique follower-following pairs
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Prevent users from following themselves
followSchema.pre('save', function(next) {
  if (this.follower.equals(this.following)) {
    next(new Error('Users cannot follow themselves'));
  }
  next();
});

module.exports = mongoose.model('Follow', followSchema);
