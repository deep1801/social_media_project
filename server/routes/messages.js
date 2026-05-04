const express = require('express');
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  deleteAllMessages,
} = require('../controllers/messages');

const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// Specific routes BEFORE wildcard routes
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getOrCreateConversation);
router.delete('/conversation/:conversationId/clear', deleteAllMessages);

// Wildcard routes
router.get('/:conversationId', getMessages);
router.post('/:conversationId', upload.single('image'), sendMessage);
router.put('/:conversationId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;
