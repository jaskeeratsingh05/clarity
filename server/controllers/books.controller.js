const Book = require('../models/Book');
const { createError } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const { processBook } = require('../services/bookProcessor.service');

// POST /api/books/upload
const uploadBook = async (req, res, next) => {
  try {
    if (!req.file) return next(createError('No file uploaded', 400));

    const { originalname, buffer, mimetype, size } = req.file;
    const fileType = originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';

    // 1. Upload raw file to Cloudinary
    const { url, publicId } = await uploadToCloudinary(buffer, originalname, mimetype);

    // 2. Create book record in DB
    const book = await Book.create({
      userId: req.user._id,
      title: req.body.title || originalname.replace(/\.[^/.]+$/, ''),
      originalFilename: originalname,
      fileType,
      fileSize: size,
      cloudinaryUrl: url,
      cloudinaryPublicId: publicId,
      status: 'extracting',
    });

    // 3. Respond immediately, then process in background
    res.status(201).json({ success: true, book });

    // 4. Kick off async processing pipeline (emit socket progress events)
    const io = req.app.get('io');
    processBook(book, buffer, io).catch((err) => {
      console.error(`❌ Book processing failed for ${book._id}:`, err.message);
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/books
const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: books.length, books });
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return next(createError('Book not found', 404));
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return next(createError('Book not found', 404));

    // Delete from Cloudinary
    await deleteFromCloudinary(book.cloudinaryPublicId);

    // TODO Phase 3: Also delete vectors from Qdrant

    await book.deleteOne();
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id/glossary
const getGlossary = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return next(createError('Book not found', 404));
    if (book.status !== 'ready') return next(createError('Book is still processing', 422));

    // TODO Phase 4: Generate glossary from chunks using Gemini
    res.json({ success: true, glossary: [], message: 'Glossary generation coming in Phase 4' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadBook, getBooks, getBook, deleteBook, getGlossary };
