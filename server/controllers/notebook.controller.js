const Note = require('../models/Note');
const { createError } = require('../middleware/errorHandler');

const saveNote = async (req, res, next) => {
  try {
    const { bookId, messageId, content, page, paragraph, chapter, tags, color } = req.body;
    const note = await Note.create({ userId: req.user._id, bookId, messageId, content, page, paragraph, chapter, tags, color });
    res.status(201).json({ success: true, note });
  } catch (err) { next(err); }
};

const getNotes = async (req, res, next) => {
  try {
    const { bookId } = req.query;
    const filter = { userId: req.user._id };
    if (bookId) filter.bookId = bookId;
    const notes = await Note.find(filter).populate('bookId', 'title').sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (err) { next(err); }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return next(createError('Note not found', 404));
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) { next(err); }
};

module.exports = { saveNote, getNotes, deleteNote };
