require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const {
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
} = require('./utils/database');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');

/**
 * dAItaniverse Express Server
 * Main server file for the SUPERNova platform
 */

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Security Middleware
 * Helmet provides security headers
 */
app.use(helmet());

/**
 * CORS Configuration
 * Allow requests from frontend applications
 */
const allowedOrigins = [
  'http://localhost:3000', // Frontend dev server
  'http://localhost:5173', // Vite dev server
  process.env.FRONTEND_URL, // Production frontend
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * Logging Middleware
 * Morgan for HTTP request logging
 */
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Compression Middleware
 * Compress response bodies for better performance
 */
app.use(compression());

/**
 * Health Check Endpoint
 * Returns server and database status
 */
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();

    res.status(dbHealth.connected ? 200 : 503).json({
      success: true,
      status: dbHealth.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: dbHealth,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

/**
 * Root Endpoint
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to dAItaniverse API',
    version: '1.0.0',
    platform: 'SUPERNova',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      subscription: '/api/subscription',
    },
  });
});

/**
 * 404 Handler
 * Must be after all valid routes
 */
app.use(notFoundHandler);

/**
 * Error Handler
 * Must be last middleware
 */
app.use(errorHandler);

/**
 * Graceful Shutdown Handler
 * Handles SIGTERM and SIGINT signals
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server
  server.close(async () => {
    console.log('✅ HTTP server closed');

    try {
      // Disconnect from database
      await disconnectDatabase();
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

/**
 * Start Server
 */
let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 dAItaniverse Server Started Successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`💳 Subscription API: http://localhost:${PORT}/api/subscription`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
