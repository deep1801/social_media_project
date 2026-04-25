const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { createNotification } = require('./notifications');

// @desc    Get all conversations for logged in user
// @route   GET /api/v1/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Conversation.find({
    
    participants: req.user.id,
  })
    .populate('participants', ['name', 'avatar'])
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name avatar',
      },
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

// @desc    Get or create conversation with a user
// @route   GET /api/v1/messages/conversation/:userId
// @access  Private
exports.getOrCreateConversation = asyncHandler(async (req, res, next) => {
  const otherUser = await User.findById(req.params.userId);

  if (!otherUser) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.userId}`, 404)
    );
  }

  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, req.params.userId] },
  })
    .populate('participants', ['name', 'avatar'])
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name avatar',
      },
    });

  // Create new conversation if doesn't exist
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user.id, req.params.userId],
    });
    await conversation.populate('participants', ['name', 'avatar']);
  }

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

// @desc    Get messages in a conversation
// @route   GET /api/v1/messages/:conversationId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);

  if (!conversation) {
    return next(
      new ErrorResponse(
        `Conversation not found with id of ${req.params.conversationId}`,
        404
      )
    );
  }

  // Check if user is participant
  if (!conversation.participants.includes(req.user.id)) {
    return next(
      new ErrorResponse('Not authorized to access this conversation', 401)
    );
  }

  const messages = await Message.find({
    conversation: req.params.conversationId,
  })
    .populate('sender', ['name', 'avatar'])
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

// @desc    Send a message
// @route   POST /api/v1/messages/:conversationId
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);

  if (!conversation) {
    return next(
      new ErrorResponse(
        `Conversation not found with id of ${req.params.conversationId}`,
        404
      )
    );
  }

  // Check if user is participant
  if (!conversation.participants.includes(req.user.id)) {
    return next(
      new ErrorResponse('Not authorized to send messages in this conversation', 401)
    );
  }

  const message = await Message.create({
    conversation: req.params.conversationId,
    sender: req.user.id,
    text: req.body.text,
  });

  await message.populate('sender', ['name', 'avatar']);

  // Update conversation's last message
  conversation.lastMessage = message._id;
  conversation.updatedAt = Date.now();
  await conversation.save();

  // Create notification for other participant
  const otherParticipant = conversation.participants.find(
    (p) => p.toString() !== req.user.id
  );
  const currentUser = await User.findById(req.user.id);
  await createNotification(
    otherParticipant,
    req.user.id,
    'message',
    `${currentUser.name} sent you a message`
  );

  res.status(201).json({
    success: true,
    data: message,
  });
});

// @desc    Mark messages as read
// @route   PUT /api/v1/messages/:conversationId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);

  if (!conversation) {
    return next(
      new ErrorResponse(
        `Conversation not found with id of ${req.params.conversationId}`,
        404
      )
    );
  }

  // Check if user is participant
  if (!conversation.participants.includes(req.user.id)) {
    return next(
      new ErrorResponse('Not authorized to access this conversation', 401)
    );
  }

  // Mark all messages from other user as read
  await Message.updateMany(
    {
      conversation: req.params.conversationId,
      sender: { $ne: req.user.id },
      read: false,
    },
    { read: true }
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});


// inside controllers/messages.js (add near other exports)
// controllers/messages.js (add/replace deleteMessage export)
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const messageId = req.params.messageId;

  // find the message
  let message = await Message.findById(messageId);

  if (!message) {
    // not found
    return next(new ErrorResponse(`Message not found with id of ${messageId}`, 404));
  }

  // Check permission: only sender can delete their own message
  if (message.sender.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this message', 401));
  }

  // Delete the message - use deleteOne on model to be safe
  // If message is a Mongoose document, you can call deleteOne() on it
  try {
    if (typeof message.deleteOne === 'function') {
      // document instance method
      await message.deleteOne();
    } else {
      // fallback to model-level deletion
      await Message.findByIdAndDelete(messageId);
    }
  } catch (err) {
    // fallback safe delete
    await Message.deleteOne({ _id: messageId });
  }

  // Update conversation.lastMessage if it referenced the deleted message
  const conversation = await Conversation.findById(message.conversation);
  if (conversation) {
    if (conversation.lastMessage && conversation.lastMessage.toString() === messageId) {
      // find latest remaining message in conversation
      const latest = await Message.findOne({ conversation: conversation._id }).sort({ createdAt: -1 });

      conversation.lastMessage = latest ? latest._id : null;
      conversation.updatedAt = Date.now();
      await conversation.save();
    }
  }

  return res.status(200).json({
    success: true,
    data: {},
  });
});



// controllers/messages.js
// Add this near your other exports (after deleteMessage or with other endpoints)

exports.deleteAllMessages = asyncHandler(async (req, res, next) => {
  const conversationId = req.params.conversationId;

  // Validate conversation exists
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return next(
      new ErrorResponse(
        `Conversation not found with id of ${conversationId}`,
        404
      )
    );
  }

  // Check permission: only participants can clear the conversation
  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse('Not authorized to clear this conversation', 401));
  }

  // Delete all messages in conversation
  await Message.deleteMany({ conversation: conversationId });

  // After deleting, set lastMessage to null and update timestamp
  conversation.lastMessage = null;
  conversation.updatedAt = Date.now();
  await conversation.save();

  return res.status(200).json({
    success: true,
    data: {},
    message: 'All messages deleted for this conversation.',
  });
});
