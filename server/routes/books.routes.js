const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadBook,
  getBooks,
  getBook,
  deleteBook,
  getGlossary,
} = require('../controllers/books.controller');

// POST /api/books/upload
router.post('/upload', protect, upload.single('file'), uploadBook);

// GET /api/books
router.get('/', protect, getBooks);

// GET /api/books/:id
router.get('/:id', protect, getBook);

// DELETE /api/books/:id
router.delete('/:id', protect, deleteBook);

// GET /api/books/:id/glossary
router.get('/:id/glossary', protect, getGlossary);

module.exports = router;
