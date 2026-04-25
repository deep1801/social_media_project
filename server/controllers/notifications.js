const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all notifications for logged in user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', ['name', 'avatar'])
    .populate('post', ['text'])
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    read: false,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns notification
  if (notification.recipient.toString() !== req.user.id) {
    return next(
      new ErrorResponse('Not authorized to update this notification', 401)
    );
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns notification
  if (notification.recipient.toString() !== req.user.id) {
    return next(
      new ErrorResponse('Not authorized to delete this notification', 401)
    );
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// Helper function to create notification
exports.createNotification = async (recipientId, senderId, type, message, postId = null) => {
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      post: postId,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
