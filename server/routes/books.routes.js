const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validateObjectId } = require('../middleware/validateObjectId');
const {
  uploadBook,
  getBooks,
  getBook,
  deleteBook,
  getGlossary,
} = require('../controllers/books.controller');

// POST /api/books/upload — rate limited to 5/hour, authenticated
router.post('/upload', protect, uploadLimiter, upload.single('file'), uploadBook);

// GET /api/books
router.get('/', protect, getBooks);

// GET /api/books/:id — validate ObjectId first
router.get('/:id', protect, validateObjectId('id'), getBook);

// DELETE /api/books/:id — validate ObjectId first
router.delete('/:id', protect, validateObjectId('id'), deleteBook);

// GET /api/books/:id/glossary — validate ObjectId first
router.get('/:id/glossary', protect, validateObjectId('id'), getGlossary);

module.exports = router;
