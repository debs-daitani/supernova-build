const { Prisma } = require('@prisma/client');

/**
 * Error Handler Middleware
 * Centralized error handling for Express app
 * Handles Prisma errors, validation errors, and general errors
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Prisma Client Known Request Errors
 */
const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target?.[0] || 'field';
        return new AppError(
          `A record with this ${field} already exists`,
          409
        );
      case 'P2025':
        // Record not found
        return new AppError('Record not found', 404);
      case 'P2003':
        // Foreign key constraint violation
        return new AppError('Related record not found', 400);
      case 'P2014':
        // Invalid ID
        return new AppError('Invalid ID provided', 400);
      default:
        return new AppError('Database operation failed', 400);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError('Invalid data provided', 400);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database connection failed', 503);
  }

  return null;
};

/**
 * Development Error Response
 * Includes stack trace and full error details
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      details: err,
    },
  });
};

/**
 * Production Error Response
 * Sends clean error message without sensitive details
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong',
        statusCode: 500,
      },
    });
  }
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Check if it's a Prisma error and convert it
  const prismaError = handlePrismaError(err);
  if (prismaError) {
    err = prismaError;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again', 401);
  }
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Token expired. Please log in again', 401);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    err = new AppError(`Invalid input: ${messages.join(', ')}`, 400);
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

/**
 * 404 Not Found Handler
 * Catches all undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
};
