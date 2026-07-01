const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google  — verify Firebase token & return app JWT
router.post('/google', googleAuth);

// GET /api/auth/me  — get current user
router.get('/me', protect, getMe);

module.exports = router;
