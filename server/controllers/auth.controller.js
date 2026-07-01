const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(createError('Please provide name, email, and password', 400));

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
    const { email, password } = req.body;
    if (!email || !password) return next(createError('Please provide email and password', 400));

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
// The client sends a Firebase ID token; we verify it server-side via the protect middleware
// and return a JWT for subsequent API calls.
const googleAuth = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware when a Firebase token is verified
    // Call this route with: Authorization: Bearer <firebaseIdToken>
    // For consistency, route through protect middleware before this
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
