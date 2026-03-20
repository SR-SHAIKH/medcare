require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Allowed Origins (IMPORTANT)
const allowedOrigins = [
  "http://localhost:5173",
  "https://medcare-9ifh.onrender.com"
];

// ✅ Socket.io setup (FIXED)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to controllers
app.set('io', io);

// ✅ Middleware
app.use(helmet());

// ✅ CORS FIX (MAIN FIX)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize()); // optional
// app.use(xss()); // disabled (Express 5 issue)
app.use(morgan('dev'));

// ✅ Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Rate limiting (General)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// ✅ Auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ✅ Socket events
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

// ✅ Routes
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const services = require('./routes/services');
const doctors = require('./routes/doctors');
const slots = require('./routes/slots');
const appointments = require('./routes/appointments');
const payments = require('./routes/payments');
const doctorDashboard = require('./routes/doctorDashboard');
const patientDashboard = require('./routes/patientDashboard');
const profile = require('./routes/profile');

// Root route
app.get("/", (req, res) => {
  res.send("MedCare API is running 🚀");
});

// API Routes
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/services', services);
app.use('/api/doctors', doctors);
app.use('/api/slots', slots);
app.use('/api/appointments', appointments);
app.use('/api/payments', payments);
app.use('/api/doctor', doctorDashboard);
app.use('/api/patient', patientDashboard);
app.use('/api/profile', profile);

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ✅ PORT (Render compatible)
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});