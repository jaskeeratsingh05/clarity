const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register — rate limited
router.post('/register', authLimiter, register);

// POST /api/auth/login — rate limited
router.post('/login', authLimiter, login);

// POST /api/auth/google  — verify Firebase token & return app JWT
router.post('/google', authLimiter, googleAuth);

// GET /api/auth/me  — get current user
router.get('/me', protect, getMe);

module.exports = router;
