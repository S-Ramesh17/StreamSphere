const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const socketHandler = require('./sockets/socketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ================================
// Allowed Origins
// ================================
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

console.log('Allowed Origins:', allowedOrigins);

// ================================
// Database Connection
// ================================
connectDB();

// ================================
// CORS Configuration
// ================================
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin
    // (Postman, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS Blocked Origin: ${origin}`);

    return callback(null, false);
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ================================
// Body Parsers
// ================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}));

// ================================
// Socket.IO
// ================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ================================
// API Routes
// ================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/streams', require('./routes/streamRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ================================
// Health Check
// ================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date()
  });
});

// ================================
// Root Route
// ================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StreamSphere Backend Running'
  });
});

// ================================
// 404 Handler
// ================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ================================
// Global Error Handler
// ================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ================================
// Socket Handler
// ================================
socketHandler(io);

// ================================
// Server Start
// ================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
=====================================
🚀 StreamSphere Server Started
🌐 Port: ${PORT}
🛠 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Allowed Origins:
${allowedOrigins.join('\n')}
=====================================
`);
});