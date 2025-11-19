/**
 * Application Configuration Module
 * Centralized configuration management with environment variable validation
 */

require('dotenv').config();

const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'supernova-ai',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  },

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'supernova',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'supernova_db',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
    ssl: process.env.DB_SSL === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },

  // Cache
  cache: {
    sessionTTL: parseInt(process.env.CACHE_SESSION_TTL || '300', 10),
    userPrefsTTL: parseInt(process.env.CACHE_USER_PREFS_TTL || '300', 10),
    conversationTTL: parseInt(process.env.CACHE_CONVERSATION_TTL || '120', 10),
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    sessionSecret: process.env.SESSION_SECRET || 'change-me-in-production',
    sessionExpiry: parseInt(process.env.SESSION_EXPIRY || '86400', 10),
    apiKey: process.env.API_KEY || '',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // AI Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '2000', 10),
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    dir: process.env.LOG_DIR || './logs',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '7', 10),
  },

  // Memory & Performance
  memory: {
    retentionDays: parseInt(process.env.MEMORY_RETENTION_DAYS || '90', 10),
    contextWindowSize: parseInt(process.env.CONTEXT_WINDOW_SIZE || '50', 10),
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '10000', 10),
  },

  // Session
  session: {
    timeoutHours: parseInt(process.env.SESSION_TIMEOUT_HOURS || '24', 10),
    cleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '3600', 10),
  },

  // Performance
  performance: {
    workerThreads: parseInt(process.env.WORKER_THREADS || '4', 10),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100', 10),
  },

  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    enableTracing: process.env.ENABLE_TRACING === 'true',
    jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30', 10),
  },

  // Feature Flags
  features: {
    semanticSearch: process.env.ENABLE_SEMANTIC_SEARCH === 'true',
    conversationSummaries: process.env.ENABLE_CONVERSATION_SUMMARIES === 'true',
    knowledgeExtraction: process.env.ENABLE_KNOWLEDGE_EXTRACTION === 'true',
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    dataExport: process.env.ENABLE_DATA_EXPORT === 'true',
  },

  // Development
  development: {
    debug: process.env.DEBUG === 'true',
    verboseLogging: process.env.VERBOSE_LOGGING === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enablePlayground: process.env.ENABLE_PLAYGROUND === 'true',
  },
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const errors = [];

  // Check critical database settings
  if (!config.database.password && config.app.env === 'production') {
    errors.push('DB_PASSWORD is required in production');
  }

  // Check JWT secret
  if (config.security.jwtSecret === 'change-me-in-production' && config.app.env === 'production') {
    errors.push('JWT_SECRET must be changed in production');
  }

  // Check session secret
  if (config.security.sessionSecret === 'change-me-in-production' && config.app.env === 'production') {
    errors.push('SESSION_SECRET must be changed in production');
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    if (config.app.env === 'production') {
      process.exit(1);
    }
  }
}

// Validate configuration on load
validateConfig();

module.exports = config;
