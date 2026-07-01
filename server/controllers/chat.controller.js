const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Book = require('../models/Book');
const { createError } = require('../middleware/errorHandler');
const { ragQuery } = require('../services/rag.service');

// POST /api/chat/:bookId — Ask a question (streaming)
const askQuestion = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { question, conversationId, aiMode = 'book', explanationStyle = 'student', language = 'english' } = req.body;

    if (!question) return next(createError('Question is required', 400));

    const book = await Book.findOne({ _id: bookId, userId: req.user._id });
    if (!book) return next(createError('Book not found', 404));
    if (book.status !== 'ready') return next(createError('Book is still processing', 422));

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, bookId, userId: req.user._id });
      if (!conversation) return next(createError('Conversation not found', 404));
    } else {
      // Auto-create a new conversation titled with the first question
      conversation = await Conversation.create({
        bookId,
        userId: req.user._id,
        title: question.slice(0, 60) + (question.length > 60 ? '...' : ''),
      });
    }

    // Save user message
    await Message.create({ conversationId: conversation._id, bookId, role: 'user', content: question, aiMode, explanationStyle, language });

    // Fetch previous messages for context (last 10)
    const history = await Message.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(10);
    const chatHistory = history.reverse().map((m) => ({ role: m.role, content: m.content }));

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Run RAG pipeline and stream response
    const { answer, citation } = await ragQuery({
      bookId,
      question,
      chatHistory,
      aiMode,
      explanationStyle,
      language,
      onChunk: (chunk) => res.write(`data: ${JSON.stringify({ chunk })}\n\n`),
    });

    // Save assistant message with citation
    const assistantMsg = await Message.create({
      conversationId: conversation._id,
      bookId,
      role: 'assistant',
      content: answer,
      citation,
      aiMode,
      explanationStyle,
      language,
    });

    // Update conversation metadata
    await Conversation.findByIdAndUpdate(conversation._id, {
      $inc: { messageCount: 2 },
      lastMessageAt: new Date(),
    });

    // Update book question count
    await Book.findByIdAndUpdate(bookId, { $inc: { questionsAsked: 1 } });

    // End SSE stream
    res.write(`data: ${JSON.stringify({ done: true, messageId: assistantMsg._id, citation, conversationId: conversation._id })}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/:bookId/conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ bookId: req.params.bookId, userId: req.user._id }).sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

// POST /api/chat/:bookId/conversations
const createConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.create({
      bookId: req.params.bookId,
      userId: req.user._id,
      title: req.body.title || 'New Conversation',
    });
    res.status(201).json({ success: true, conversation });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/:bookId/conversations/:convId
const getConversationMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversationId: req.params.convId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/chat/:bookId/conversations/:convId
const deleteConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.findOne({ _id: req.params.convId, userId: req.user._id });
    if (!conv) return next(createError('Conversation not found', 404));
    await Message.deleteMany({ conversationId: conv._id });
    await conv.deleteOne();
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { askQuestion, getConversations, createConversation, getConversationMessages, deleteConversation };
