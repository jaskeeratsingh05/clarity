const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  askQuestion,
  getConversations,
  createConversation,
  getConversationMessages,
  deleteConversation,
} = require('../controllers/chat.controller');

// POST /api/chat/:bookId  — ask a question (streaming)
router.post('/:bookId', protect, askQuestion);

// GET /api/chat/:bookId/conversations
router.get('/:bookId/conversations', protect, getConversations);

// POST /api/chat/:bookId/conversations
router.post('/:bookId/conversations', protect, createConversation);

// GET /api/chat/:bookId/conversations/:convId
router.get('/:bookId/conversations/:convId', protect, getConversationMessages);

// DELETE /api/chat/:bookId/conversations/:convId
router.delete('/:bookId/conversations/:convId', protect, deleteConversation);

module.exports = router;
