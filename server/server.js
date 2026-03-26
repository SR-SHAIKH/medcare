require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const connectDB = require('./config/db');
// const ensureAdminExists = require('./utils/seed'); // path check karo
const ensureAdminExists = require('./config/seed');

// ────────────────────────────────────────────
// 1. ENVIRONMENT VALIDATION
// ────────────────────────────────────────────
console.log('══════════════════════════════════════════');
console.log('  MEDCARE API — Starting up...');
console.log('══════════════════════════════════════════');

console.log('[ENV] NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('[ENV] MONGO_URI:', process.env.MONGO_URI ? '✅ SET' : '❌ MISSING');
console.log('[ENV] JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '⚠️ USING FALLBACK');
console.log('[ENV] JWT_EXPIRE:', process.env.JWT_EXPIRE ? '✅ SET' : '⚠️ USING DEFAULT 30d');
console.log('[ENV] PORT:', process.env.PORT || '5000 (default)');
console.log('[ENV] ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ SET' : '⚠️ NOT SET (no auto-seed)');

if (!process.env.MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI is not set. Set it in Render Environment tab.');
  process.exit(1);
}

// ────────────────────────────────────────────
// 2. EXPRESS + HTTP + SOCKET.IO SETUP
// ────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to controllers
app.set('io', io);

// ────────────────────────────────────────────
// 3. MIDDLEWARE (ORDER MATTERS)
// ────────────────────────────────────────────

// 3a. CORS — must be FIRST
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// 3b. Helmet — AFTER CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 3c. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3d. Logging
app.use(morgan('dev'));

// 3e. Debug auth requests
app.use('/api/auth', (req, res, next) => {
  console.log(`[AUTH ${req.method}] ${req.path} — Body:`, JSON.stringify(req.body));
  next();
});

// 3f. Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3g. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ────────────────────────────────────────────
// 4. SOCKET.IO EVENTS
// ────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ────────────────────────────────────────────
// 5. ROUTES (wrapped in try-catch to catch import errors)
// ────────────────────────────────────────────

// Root health check route (works even if DB is down)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'MedCare API is running 🚀' });
});

try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/services', require('./routes/services'));
  app.use('/api/doctors', require('./routes/doctors'));
  app.use('/api/slots', require('./routes/slots'));
  app.use('/api/appointments', require('./routes/appointments'));
  app.use('/api/payments', require('./routes/payments'));
  app.use('/api/doctor', require('./routes/doctorDashboard'));
  app.use('/api/patient', require('./routes/patientDashboard'));
  app.use('/api/profile', require('./routes/profile'));
  console.log('✅ All routes loaded successfully');
} catch (err) {
  console.error('❌ ROUTE IMPORT ERROR:', err.message);
  console.error(err.stack);
  // Don't exit — let the health check route still work for debugging
}

// ────────────────────────────────────────────
// 6. ERROR HANDLER
// ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ────────────────────────────────────────────
// 7. START SERVER (DB first, then listen)
// ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB FIRST
    await connectDB();

    // Seed admin user if not exists
    await ensureAdminExists();

    // Only start listening AFTER DB is ready
    server.listen(PORT, '0.0.0.0', () => {
      console.log('══════════════════════════════════════════');
      console.log(`  ✅ Server running on port ${PORT}`);
      console.log('══════════════════════════════════════════');
    });
  } catch (err) {
    console.error('══════════════════════════════════════════');
    console.error('  ❌ FAILED TO START SERVER');
    console.error('  Error:', err.message);
    console.error('══════════════════════════════════════════');
    process.exit(1);
  }
};

startServer();