const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    // Citation info (only for assistant messages)
    citation: {
      chapter: { type: String, default: null },
      chapterNumber: { type: Number, default: null },
      page: { type: Number, default: null },
      paragraph: { type: Number, default: null },
      sentence: { type: String, default: null },
      confidence: { type: Number, default: null }, // 0–100
      sourceText: { type: String, default: null }, // the exact chunk text used
    },
    // AI settings used for this response
    aiMode: { type: String, enum: ['book', 'hybrid'], default: 'book' },
    explanationStyle: { type: String, default: 'student' },
    language: { type: String, default: 'english' },
    isSaved: { type: Boolean, default: false }, // saved to notebook
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
