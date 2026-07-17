const multer = require('multer');
const path = require('path');
const { createError } = require('./errorHandler');

// Store in memory — we'll upload directly to Cloudinary
const storage = multer.memoryStorage();

/**
 * Magic bytes (file signatures) for allowed types.
 * Extension spoofing (renaming malware.exe to malware.pdf) is stopped here.
 *
 * PDF:  starts with %PDF  → bytes 25 50 44 46
 * DOCX: starts with PK    → bytes 50 4B (ZIP-based Office format)
 */
const MAGIC_BYTES = {
  pdf: [0x25, 0x50, 0x44, 0x46],  // %PDF
  docx: [0x50, 0x4b],              // PK (ZIP signature)
};

const checkMagicBytes = (buffer, type) => {
  const magic = MAGIC_BYTES[type];
  if (!magic) return false;
  return magic.every((byte, i) => buffer[i] === byte);
};

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(createError('Only PDF and DOCX files are supported', 400), false);
  }

  // We can't check magic bytes here (no buffer yet in fileFilter)
  // Magic byte check happens in the controller after buffer is available
  cb(null, true);
};

/**
 * Validates the actual file content against its claimed extension.
 * Call this inside your controller after req.file is populated.
 * Throws if the file content doesn't match the extension.
 */
const validateFileMagicBytes = (file) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const typeMap = { pdf: 'pdf', docx: 'docx' };
  const type = typeMap[ext];

  if (!type || !checkMagicBytes(file.buffer, type)) {
    throw createError('File content does not match the declared file type. Upload may be corrupted or malicious.', 400);
  }

  return true;
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
    files: 1, // Only one file per request
  },
});

module.exports = { upload, validateFileMagicBytes };
