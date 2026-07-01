const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
    content: { type: String, required: true },
    // Location in the book
    page: { type: Number, default: null },
    paragraph: { type: Number, default: null },
    chapter: { type: String, default: null },
    // User-added tags
    tags: [{ type: String, trim: true }],
    color: { type: String, default: '#6C63FF' }, // highlight color
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
