const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // null for Google users
    googleId: { type: String, sparse: true },
    avatar: { type: String, default: '' },
    plan: { type: String, enum: ['free', 'student', 'pro'], default: 'free' },
    storageUsed: { type: Number, default: 0 }, // in bytes
    questionsUsed: { type: Number, default: 0 },
    preferences: {
      defaultExplanationStyle: {
        type: String,
        enum: ['beginner', 'student', 'exam', 'interview', 'technical', 'simple'],
        default: 'student',
      },
      defaultAIMode: { type: String, enum: ['book', 'hybrid'], default: 'book' },
      defaultLanguage: { type: String, enum: ['english', 'hindi'], default: 'english' },
      defaultVoice: { type: String, default: 'female_teacher' },
    },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
