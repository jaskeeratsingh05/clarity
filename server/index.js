const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ── Allowed client origins ─────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

// Socket.io setup (for real-time upload progress)
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// ── Security Headers (Helmet) ──────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", ...ALLOWED_ORIGINS],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Cloudinary images
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
);

// ── CORS ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Global Rate Limiter ────────────────────────────────────────
app.use('/api/', globalLimiter);

// ── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '1mb' })); // Reduced from 50mb — files go via multipart
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/books', require('./routes/books.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/notebook', require('./routes/notebook.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clarity API is running', timestamp: new Date().toISOString() });
});

// ── Socket.io connection ───────────────────────────────────────
io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user:${userId}`); // Each user in their own room
    console.log(`🔌 User ${userId} connected: ${socket.id}`);
  } else {
    console.log(`🔌 Unauthenticated socket connected: ${socket.id}`);
  }

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ── Error handler (must be last) ──────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Clarity server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security headers: enabled`);
  console.log(`🛡️  Rate limiting: enabled`);
});
