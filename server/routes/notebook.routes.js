const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { saveNote, getNotes, deleteNote } = require('../controllers/notebook.controller');

router.post('/', protect, saveNote);
router.get('/', protect, getNotes);
router.delete('/:id', protect, deleteNote);

module.exports = router;
