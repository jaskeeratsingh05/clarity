const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── Input sanitization helper ──────────────────────────────────
const sanitizeString = (str) => (typeof str === 'string' ? str.trim().slice(0, 500) : '');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    // Input validation
    if (!name || !email || !password) return next(createError('Please provide name, email, and password', 400));
    if (name.length < 2 || name.length > 100) return next(createError('Name must be between 2 and 100 characters', 400));
    if (!EMAIL_REGEX.test(email)) return next(createError('Please provide a valid email address', 400));
    if (email.length > 254) return next(createError('Email address is too long', 400));
    if (password.length < 8) return next(createError('Password must be at least 8 characters', 400));
    if (password.length > 128) return next(createError('Password is too long', 400));

    const existing = await User.findOne({ email });
    if (existing) return next(createError('An account with this email already exists', 409));

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) return next(createError('Please provide email and password', 400));
    if (!EMAIL_REGEX.test(email)) return next(createError('Invalid credentials', 401)); // Don't reveal validation detail
    if (password.length > 128) return next(createError('Invalid credentials', 401));

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return next(createError('Invalid email or password', 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(createError('Invalid email or password', 401));

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google — used after Firebase client-side Google sign-in
const googleAuth = async (req, res, next) => {
  try {
    res.json({ success: false, message: 'Use Authorization header with Firebase token on /api/auth/me' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, googleAuth, getMe };
