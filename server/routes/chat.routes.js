const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const { validateObjectId } = require('../middleware/validateObjectId');
const {
  askQuestion,
  getConversations,
  createConversation,
  getConversationMessages,
  deleteConversation,
} = require('../controllers/chat.controller');

// POST /api/chat/:bookId — rate limited (prevents Gemini quota abuse)
router.post('/:bookId', protect, chatLimiter, validateObjectId('bookId'), askQuestion);

// GET /api/chat/:bookId/conversations
router.get('/:bookId/conversations', protect, validateObjectId('bookId'), getConversations);

// POST /api/chat/:bookId/conversations
router.post('/:bookId/conversations', protect, validateObjectId('bookId'), createConversation);

// GET /api/chat/:bookId/conversations/:convId
router.get('/:bookId/conversations/:convId', protect, validateObjectId('bookId', 'convId'), getConversationMessages);

// DELETE /api/chat/:bookId/conversations/:convId
router.delete('/:bookId/conversations/:convId', protect, validateObjectId('bookId', 'convId'), deleteConversation);

module.exports = router;
