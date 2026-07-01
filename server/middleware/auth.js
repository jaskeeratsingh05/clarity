const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * Verify JWT (email/password users) OR Firebase ID token (Google users).
 * Attaches req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized — no token' });
    }

    const token = authHeader.split(' ')[1];

    // Try JWT first (email/password login)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });
      req.user = user;
      return next();
    } catch (jwtError) {
      // If JWT fails, try Firebase token (Google login)
      try {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        let user = await User.findOne({ email: decodedFirebase.email });
        if (!user) {
          // Auto-create user on first Google login
          user = await User.create({
            name: decodedFirebase.name || decodedFirebase.email.split('@')[0],
            email: decodedFirebase.email,
            googleId: decodedFirebase.uid,
            avatar: decodedFirebase.picture || '',
            isEmailVerified: true,
          });
        }
        req.user = user;
        return next();
      } catch (firebaseError) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error in auth middleware' });
  }
};

module.exports = { protect };
