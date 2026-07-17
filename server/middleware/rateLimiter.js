const rateLimit = require('express-rate-limit');

/**
 * Auth rate limiter — strict. Prevents brute-force on login/register.
 * 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts from this IP. Please try again in 15 minutes.' },
  skipSuccessfulRequests: false,
});

/**
 * Upload rate limiter — 5 uploads per hour per IP.
 * Prevents Cloudinary/storage abuse.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached. You can upload up to 5 files per hour.' },
});

/**
 * Chat/AI rate limiter — 60 questions per 10 minutes per IP.
 * Prevents Gemini API quota exhaustion.
 */
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many questions. Please slow down and try again shortly.' },
});

/**
 * General API limiter — 200 requests per 10 minutes per IP.
 * Applied globally to catch everything else.
 */
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please slow down.' },
});

module.exports = { authLimiter, uploadLimiter, chatLimiter, globalLimiter };
