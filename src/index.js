/**
 * SUPERNova AI Memory System - Main Application Entry Point
 * Production-ready Node.js application with proper error handling and graceful shutdown
 */

const http = require('http');
const process = require('process');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Application state
let server;
let isShuttingDown = false;

/**
 * Simple request router
 */
function handleRequest(req, res) {
  const { method, url } = req;

  // Set common headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Powered-By', 'SUPERNova AI');

  // Health check endpoint
  if (url === '/health' || url === '/healthz') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV
    }));
    return;
  }

  // Readiness check endpoint
  if (url === '/ready' || url === '/readiness') {
    if (isShuttingDown) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        status: 'not ready',
        reason: 'shutting down'
      }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'ready',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Liveness check endpoint
  if (url === '/live' || url === '/liveness') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'alive',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // API info endpoint
  if (url === '/' || url === '/api') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      name: 'SUPERNova AI Memory System',
      version: '1.0.0',
      description: 'Comprehensive memory system for AI conversations',
      environment: NODE_ENV,
      endpoints: {
        health: '/health',
        readiness: '/ready',
        liveness: '/live',
        api: '/api/v1'
      },
      documentation: 'https://github.com/debs-daitani/supernova-build'
    }));
    return;
  }

  // API v1 placeholder
  if (url.startsWith('/api/v1')) {
    res.statusCode = 200;
    res.end(JSON.stringify({
      message: 'SUPERNova AI API v1',
      status: 'operational',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 404 for unknown routes
  res.statusCode = 404;
  res.end(JSON.stringify({
    error: 'Not Found',
    message: `Route ${url} not found`,
    timestamp: new Date().toISOString()
  }));
}

/**
 * Start the HTTP server
 */
function startServer() {
  server = http.createServer(handleRequest);

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });

  server.listen(PORT, HOST, () => {
    console.log('='.repeat(60));
    console.log('SUPERNova AI Memory System');
    console.log('='.repeat(60));
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Server listening on http://${HOST}:${PORT}`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    console.log('='.repeat(60));
    console.log('Endpoints:');
    console.log(`  Health:    http://${HOST}:${PORT}/health`);
    console.log(`  Readiness: http://${HOST}:${PORT}/ready`);
    console.log(`  Liveness:  http://${HOST}:${PORT}/live`);
    console.log(`  API Info:  http://${HOST}:${PORT}/`);
    console.log('='.repeat(60));
  });
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }

      console.log('HTTP server closed');
      console.log('Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

/**
 * Error handlers
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

/**
 * Signal handlers for graceful shutdown
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start the application
 */
if (require.main === module) {
  startServer();
}

module.exports = { startServer, gracefulShutdown };
