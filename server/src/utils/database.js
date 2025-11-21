const { PrismaClient } = require('@prisma/client');

/**
 * Database Connection Utility
 * Manages Prisma Client instance and database connection
 */

// Prisma Client singleton
let prisma;

/**
 * Initialize Prisma Client
 * Creates a singleton instance with logging configuration
 */
const initPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
};

/**
 * Connect to Database
 * Establishes connection and verifies it's working
 */
const connectDatabase = async () => {
  try {
    const client = initPrisma();
    await client.$connect();
    console.log('✅ Database connected successfully');
    return client;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

/**
 * Disconnect from Database
 * Gracefully closes database connection
 */
const disconnectDatabase = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection error:', error.message);
      throw error;
    }
  }
};

/**
 * Check Database Health
 * Verifies database is accessible and responsive
 */
const checkDatabaseHealth = async () => {
  try {
    const client = getPrisma();
    await client.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      connected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get Prisma Client Instance
 * Returns existing instance or creates new one
 */
const getPrisma = () => {
  if (!prisma) {
    return initPrisma();
  }
  return prisma;
};

/**
 * Handle Database Errors
 * Provides user-friendly error messages
 */
const handleDatabaseError = (error) => {
  console.error('Database Error:', error);

  if (error.code === 'P1001') {
    return 'Cannot reach database server. Please check your connection.';
  }
  if (error.code === 'P1002') {
    return 'Database server connection timed out.';
  }
  if (error.code === 'P1003') {
    return 'Database does not exist.';
  }
  if (error.code === 'P1008') {
    return 'Database operation timed out.';
  }
  if (error.code === 'P1017') {
    return 'Database server has closed the connection.';
  }

  return 'A database error occurred.';
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  getPrisma,
  handleDatabaseError,
};
