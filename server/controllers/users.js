const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { createNotification } = require('./notifications');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('followers', ['name', 'avatar'])
    .populate('following', ['name', 'avatar']);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Follow a user
// @route   PUT /api/v1/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);

  if (!userToFollow) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if already following
  if (userToFollow.followers.includes(req.user.id)) {
    return next(new ErrorResponse('Already following this user', 400));
  }

  // Can't follow yourself
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse('You cannot follow yourself', 400));
  }

  // Add to followers
  userToFollow.followers.push(req.user.id);
  await userToFollow.save();

  // Add to current user's following
  const currentUser = await User.findById(req.user.id);
  currentUser.following.push(req.params.id);
  await currentUser.save();

  // Create notification
  await createNotification(
    req.params.id,
    req.user.id,
    'follow',
    `${currentUser.name} started following you`
  );

  res.status(200).json({
    success: true,
    data: userToFollow,
  });
});

// @desc    Unfollow a user
// @route   PUT /api/v1/users/:id/unfollow
// @access  Private
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);

  if (!userToUnfollow) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if not following
  if (!userToUnfollow.followers.includes(req.user.id)) {
    return next(new ErrorResponse('You are not following this user', 400));
  }

  // Remove from followers
  userToUnfollow.followers = userToUnfollow.followers.filter(
    (follower) => follower.toString() !== req.user.id
  );
  await userToUnfollow.save();

  // Remove from current user's following
  const currentUser = await User.findById(req.user.id);
  currentUser.following = currentUser.following.filter(
    (following) => following.toString() !== req.params.id
  );
  await currentUser.save();

  res.status(200).json({
    success: true,
    data: userToUnfollow,
  });
});
