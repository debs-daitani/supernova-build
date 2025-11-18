/**
 * SUPERNova AI - Utility Helper Functions
 *
 * Common utility functions used across the memory system
 */

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Generated ID
 */
export function generateId(prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate a user ID
 * @returns {string} Generated user ID
 */
export function generateUserId() {
  return generateId('user');
}

/**
 * Generate a conversation ID
 * @returns {string} Generated conversation ID
 */
export function generateConversationId() {
  return generateId('conv');
}

/**
 * Generate a message ID
 * @returns {string} Generated message ID
 */
export function generateMessageId() {
  return generateId('msg');
}

/**
 * Generate a session ID
 * @returns {string} Generated session ID
 */
export function generateSessionId() {
  return generateId('sess');
}

/**
 * Generate a knowledge ID
 * @returns {string} Generated knowledge ID
 */
export function generateKnowledgeId() {
  return generateId('know');
}

/**
 * Generate a context ID
 * @returns {string} Generated context ID
 */
export function generateContextId() {
  return generateId('ctx');
}

/**
 * Generate a metadata ID
 * @returns {string} Generated metadata ID
 */
export function generateMetadataId() {
  return generateId('meta');
}

// ============================================================================
// Date/Time Utilities
// ============================================================================

/**
 * Get session expiry date
 * @param {number} hours - Hours until expiry
 * @returns {Date} Expiry date
 */
export function getSessionExpiry(hours = 24) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/**
 * Get date from days ago
 * @param {number} days - Number of days ago
 * @returns {Date} Date object
 */
export function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get date from hours ago
 * @param {number} hours - Number of hours ago
 * @returns {Date} Date object
 */
export function getHoursAgo(hours) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

/**
 * Check if date is expired
 * @param {Date} expiryDate - Expiry date to check
 * @returns {boolean} True if expired
 */
export function isExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

/**
 * Format duration in milliseconds to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ============================================================================
// Token Counting
// ============================================================================

/**
 * Estimate token count for text
 * @param {string} text - Text to count tokens for
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(text) {
  if (!text || typeof text !== 'string') return 0;

  // Rough estimation: ~4 characters per token
  // This is a simplified estimate; actual tokenization varies
  return Math.ceil(text.length / 4);
}

/**
 * Calculate total tokens for an array of messages
 * @param {Array} messages - Array of message objects
 * @returns {number} Total token count
 */
export function calculateTotalTokens(messages) {
  if (!Array.isArray(messages)) return 0;

  return messages.reduce((total, message) => {
    return total + (message.tokenCount || estimateTokenCount(message.content || ''));
  }, 0);
}

/**
 * Check if token count is within limit
 * @param {number} tokenCount - Token count to check
 * @param {number} limit - Token limit
 * @returns {boolean} True if within limit
 */
export function isWithinTokenLimit(tokenCount, limit = 8000) {
  return tokenCount <= limit;
}

// ============================================================================
// Text Processing
// ============================================================================

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @param {number} limit - Maximum number of keywords
 * @returns {Array<string>} Array of keywords
 */
export function extractKeywords(text, limit = 10) {
  if (!text) return [];

  // Remove common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'where', 'when', 'why', 'how']);

  // Split text into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Sanitize text for storage
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return '';

  // Remove potentially harmful content
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate user ID format
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid
 */
export function isValidUserId(userId) {
  if (!userId || typeof userId !== 'string') return false;
  return userId.length > 0 && userId.length <= 100;
}

/**
 * Validate message content
 * @param {string} content - Message content to validate
 * @returns {Object} Validation result
 */
export function validateMessageContent(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }

  if (content.trim().length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  if (content.length > 50000) {
    return { valid: false, error: 'Content exceeds maximum length (50000 characters)' };
  }

  return { valid: true };
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Convert message to context format
 * @param {Object} message - Message object
 * @returns {Object} Context-formatted message
 */
export function messageToContext(message) {
  return {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    messageId: message.messageId
  };
}

/**
 * Convert array of messages to context format
 * @param {Array} messages - Array of message objects
 * @returns {Array} Array of context-formatted messages
 */
export function messagesToContext(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.map(messageToContext);
}

/**
 * Merge objects with deep merge for nested objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function deepMerge(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} True if object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array<Array>} Array of chunks
 */
export function chunkArray(array, size) {
  if (!Array.isArray(array)) return [];

  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array with possible duplicates
 * @returns {Array} Array without duplicates
 */
export function uniqueArray(array) {
  if (!Array.isArray(array)) return [];
  return [...new Set(array)];
}

/**
 * Sort array of objects by property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {boolean} descending - Sort in descending order
 * @returns {Array} Sorted array
 */
export function sortByProperty(array, property, descending = false) {
  if (!Array.isArray(array)) return [];

  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];

    if (aVal < bVal) return descending ? 1 : -1;
    if (aVal > bVal) return descending ? -1 : 1;
    return 0;
  });
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Create standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {*} details - Additional error details
 * @returns {Object} Error object
 */
export function createError(code, message, details = null) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date()
    }
  };
}

/**
 * Create standardized success response
 * @param {*} data - Response data
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Success object
 */
export function createSuccess(data, metadata = {}) {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date(),
      ...metadata
    }
  };
}

// ============================================================================
// Caching Utilities
// ============================================================================

/**
 * Create cache key from parameters
 * @param {string} prefix - Cache key prefix
 * @param {...any} params - Parameters to include in key
 * @returns {string} Cache key
 */
export function createCacheKey(prefix, ...params) {
  return `${prefix}:${params.join(':')}`;
}

/**
 * Check if cache entry is expired
 * @param {Object} cacheEntry - Cache entry with timestamp and ttl
 * @returns {boolean} True if expired
 */
export function isCacheExpired(cacheEntry) {
  if (!cacheEntry || !cacheEntry.timestamp || !cacheEntry.ttl) {
    return true;
  }

  const now = Date.now();
  const entryTime = new Date(cacheEntry.timestamp).getTime();
  const ttlMs = cacheEntry.ttl * 1000; // Convert seconds to milliseconds

  return (now - entryTime) > ttlMs;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // ID Generation
  generateId,
  generateUserId,
  generateConversationId,
  generateMessageId,
  generateSessionId,
  generateKnowledgeId,
  generateContextId,
  generateMetadataId,

  // Date/Time
  getSessionExpiry,
  getDaysAgo,
  getHoursAgo,
  isExpired,
  formatDuration,

  // Token Counting
  estimateTokenCount,
  calculateTotalTokens,
  isWithinTokenLimit,

  // Text Processing
  truncateText,
  extractKeywords,
  sanitizeText,

  // Validation
  isValidEmail,
  isValidUserId,
  validateMessageContent,

  // Data Transformation
  messageToContext,
  messagesToContext,
  deepMerge,

  // Array Utilities
  chunkArray,
  uniqueArray,
  sortByProperty,

  // Error Handling
  createError,
  createSuccess,

  // Caching
  createCacheKey,
  isCacheExpired
};
