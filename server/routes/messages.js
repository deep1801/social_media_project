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

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversation/:userId', getOrCreateConversation);
router.route('/:conversationId').get(getMessages).post(sendMessage);
router.put('/:conversationId/read', markAsRead);

router.delete('/:messageId', deleteMessage);


router.delete('/conversation/:conversationId/clear', deleteAllMessages);





module.exports = router;
