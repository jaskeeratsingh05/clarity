const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    originalFilename: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    fileSize: { type: Number, required: true }, // in bytes
    pageCount: { type: Number, default: 0 },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    // Processing status
    status: {
      type: String,
      enum: ['uploading', 'extracting', 'chunking', 'embedding', 'ready', 'error'],
      default: 'uploading',
    },
    processingError: { type: String, default: null },
    processingProgress: { type: Number, default: 0 }, // 0–100
    // Metadata extracted from the book
    chapters: [
      {
        number: Number,
        title: String,
        startPage: Number,
        endPage: Number,
      },
    ],
    totalChunks: { type: Number, default: 0 },
    // Analytics
    questionsAsked: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 }, // in seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
