/**
 * SUPERNova AI Memory Service
 *
 * Core service for managing AI memory operations including:
 * - Message storage and retrieval
 * - Conversation context assembly
 * - Memory search and filtering
 * - Context optimization
 */

import wixData from 'wix-data';
import { generateMessageId, generateContextId, estimateTokenCount } from '../utils/helpers';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  MESSAGES: 'SupernovaMessages',
  CONVERSATIONS: 'SupernovaConversations',
  CONTEXT: 'SupernovaContext',
  KNOWLEDGE: 'SupernovaKnowledge',
  USERS: 'SupernovaUsers'
};

const LIMITS = {
  RECENT_MESSAGES: 20,
  CONTEXT_WINDOW: 50,
  MAX_TOKEN_COUNT: 8000,
  SEARCH_RESULTS: 100
};

// ============================================================================
// Message Operations
// ============================================================================

/**
 * Store a new message in the conversation
 * @param {Object} messageInput - Message data
 * @returns {Promise<Object>} Stored message
 */
export async function storeMessage(messageInput) {
  try {
    // Generate message ID if not provided
    const messageId = messageInput.messageId || generateMessageId();

    // Estimate token count if not provided
    const tokenCount = messageInput.tokenCount || estimateTokenCount(messageInput.content);

    // Prepare message object
    const message = {
      messageId,
      conversationId: messageInput.conversationId,
      userId: messageInput.userId,
      role: messageInput.role,
      content: messageInput.content,
      timestamp: messageInput.timestamp || new Date(),
      tokenCount,
      metadata: messageInput.metadata || {},
      attachments: messageInput.attachments || [],
      inReplyTo: messageInput.inReplyTo || null,
      edited: false
    };

    // Store in database
    const result = await wixData.insert(COLLECTIONS.MESSAGES, message);

    // Update conversation metadata asynchronously
    updateConversationMetadata(messageInput.conversationId, message).catch(err => {
      console.error('Error updating conversation metadata:', err);
    });

    return result;
  } catch (error) {
    console.error('Error storing message:', error);
    throw new Error(`Failed to store message: ${error.message}`);
  }
}

/**
 * Get recent messages from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of messages to retrieve
 * @returns {Promise<Array>} Array of messages
 */
export async function getRecentMessages(conversationId, limit = LIMITS.RECENT_MESSAGES) {
  try {
    const results = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('conversationId', conversationId)
      .descending('timestamp')
      .limit(limit)
      .find();

    // Return in chronological order (oldest first)
    return results.items.reverse();
  } catch (error) {
    console.error('Error getting recent messages:', error);
    throw new Error(`Failed to retrieve messages: ${error.message}`);
  }
}

/**
 * Get messages within a specific time range
 * @param {string} conversationId - Conversation ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of messages
 */
export async function getMessagesByTimeRange(conversationId, startDate, endDate) {
  try {
    const results = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('conversationId', conversationId)
      .ge('timestamp', startDate)
      .le('timestamp', endDate)
      .ascending('timestamp')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting messages by time range:', error);
    throw new Error(`Failed to retrieve messages: ${error.message}`);
  }
}

/**
 * Search messages by content
 * @param {string} userId - User ID
 * @param {string} searchQuery - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching messages
 */
export async function searchMessages(userId, searchQuery, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.MESSAGES)
      .eq('userId', userId)
      .contains('content', searchQuery);

    if (options.conversationId) {
      query = query.eq('conversationId', options.conversationId);
    }

    if (options.role) {
      query = query.eq('role', options.role);
    }

    if (options.startDate) {
      query = query.ge('timestamp', options.startDate);
    }

    if (options.endDate) {
      query = query.le('timestamp', options.endDate);
    }

    const results = await query
      .descending('timestamp')
      .limit(options.limit || LIMITS.SEARCH_RESULTS)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw new Error(`Failed to search messages: ${error.message}`);
  }
}

/**
 * Update a message
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated message
 */
export async function updateMessage(messageId, updates) {
  try {
    const results = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('messageId', messageId)
      .find();

    if (results.items.length === 0) {
      throw new Error('Message not found');
    }

    const message = results.items[0];

    return await wixData.update(COLLECTIONS.MESSAGES, {
      _id: message._id,
      ...updates,
      edited: true,
      editedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating message:', error);
    throw new Error(`Failed to update message: ${error.message}`);
  }
}

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export async function deleteMessage(messageId) {
  try {
    const results = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('messageId', messageId)
      .find();

    if (results.items.length === 0) {
      throw new Error('Message not found');
    }

    await wixData.remove(COLLECTIONS.MESSAGES, results.items[0]._id);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

// ============================================================================
// Context Operations
// ============================================================================

/**
 * Build conversation context for AI processing
 * @param {string} userId - User ID
 * @param {string} conversationId - Conversation ID
 * @param {Object} options - Context options
 * @returns {Promise<Object>} Assembled context
 */
export async function buildConversationContext(userId, conversationId, options = {}) {
  try {
    const limit = options.limit || LIMITS.CONTEXT_WINDOW;

    // Get recent messages
    const recentMessages = await getRecentMessages(conversationId, limit);

    // Get user preferences
    const preferences = await getUserPreferences(userId);

    // Get relevant knowledge
    const knowledge = await getRelevantKnowledge(userId, options.knowledgeCategories);

    // Get conversation summary if available
    const conversation = await getConversation(conversationId);

    // Calculate total token count
    const totalTokens = recentMessages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);

    // Build context object
    const context = {
      conversationId,
      userId,
      recentMessages,
      messageCount: recentMessages.length,
      totalTokens,
      preferences,
      knowledge,
      conversationSummary: conversation?.summary || null,
      conversationContext: conversation?.context || null,
      metadata: {
        assembledAt: new Date(),
        tokenLimit: LIMITS.MAX_TOKEN_COUNT,
        withinLimit: totalTokens <= LIMITS.MAX_TOKEN_COUNT
      }
    };

    // Store context snapshot if requested
    if (options.saveSnapshot) {
      await saveContextSnapshot(context);
    }

    return context;
  } catch (error) {
    console.error('Error building conversation context:', error);
    throw new Error(`Failed to build context: ${error.message}`);
  }
}

/**
 * Save a context snapshot
 * @param {Object} context - Context data
 * @returns {Promise<Object>} Saved context
 */
export async function saveContextSnapshot(context) {
  try {
    const contextId = generateContextId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days retention

    const snapshot = {
      contextId,
      conversationId: context.conversationId,
      userId: context.userId,
      messageIds: context.recentMessages.map(msg => msg.messageId),
      summary: null, // To be generated later
      entities: [], // To be extracted later
      topics: [],
      sentiment: null,
      createdAt: new Date(),
      expiresAt,
      tokenCount: context.totalTokens,
      metadata: context.metadata
    };

    return await wixData.insert(COLLECTIONS.CONTEXT, snapshot);
  } catch (error) {
    console.error('Error saving context snapshot:', error);
    throw new Error(`Failed to save context: ${error.message}`);
  }
}

/**
 * Get context snapshots for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} Array of context snapshots
 */
export async function getContextSnapshots(conversationId) {
  try {
    const results = await wixData.query(COLLECTIONS.CONTEXT)
      .eq('conversationId', conversationId)
      .descending('createdAt')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting context snapshots:', error);
    throw new Error(`Failed to retrieve contexts: ${error.message}`);
  }
}

/**
 * Optimize context to fit within token limit
 * @param {Object} context - Full context
 * @param {number} maxTokens - Maximum token limit
 * @returns {Object} Optimized context
 */
export function optimizeContext(context, maxTokens = LIMITS.MAX_TOKEN_COUNT) {
  if (context.totalTokens <= maxTokens) {
    return context;
  }

  // Strategy: Keep most recent messages and summarize older ones
  const messages = [...context.recentMessages].reverse(); // Most recent first
  const optimizedMessages = [];
  let tokenCount = 0;

  for (const message of messages) {
    const msgTokens = message.tokenCount || 0;
    if (tokenCount + msgTokens <= maxTokens) {
      optimizedMessages.unshift(message);
      tokenCount += msgTokens;
    } else {
      break;
    }
  }

  return {
    ...context,
    recentMessages: optimizedMessages,
    messageCount: optimizedMessages.length,
    totalTokens: tokenCount,
    metadata: {
      ...context.metadata,
      optimized: true,
      originalMessageCount: context.messageCount,
      originalTokenCount: context.totalTokens
    }
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update conversation metadata after new message
 * @param {string} conversationId - Conversation ID
 * @param {Object} message - New message
 * @returns {Promise<void>}
 */
async function updateConversationMetadata(conversationId, message) {
  try {
    const results = await wixData.query(COLLECTIONS.CONVERSATIONS)
      .eq('conversationId', conversationId)
      .find();

    if (results.items.length === 0) {
      console.warn('Conversation not found for metadata update:', conversationId);
      return;
    }

    const conversation = results.items[0];

    await wixData.update(COLLECTIONS.CONVERSATIONS, {
      _id: conversation._id,
      messageCount: (conversation.messageCount || 0) + 1,
      lastMessageAt: message.timestamp,
      status: 'active'
    });
  } catch (error) {
    console.error('Error updating conversation metadata:', error);
    throw error;
  }
}

/**
 * Get conversation details
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation object
 */
async function getConversation(conversationId) {
  try {
    const results = await wixData.query(COLLECTIONS.CONVERSATIONS)
      .eq('conversationId', conversationId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
}

/**
 * Get user preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User preferences
 */
async function getUserPreferences(userId) {
  try {
    const results = await wixData.query('SupernovaPreferences')
      .eq('userId', userId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

/**
 * Get relevant knowledge for context
 * @param {string} userId - User ID
 * @param {Array<string>} categories - Knowledge categories to include
 * @returns {Promise<Array>} Array of knowledge items
 */
async function getRelevantKnowledge(userId, categories = []) {
  try {
    let query = wixData.query(COLLECTIONS.KNOWLEDGE)
      .eq('userId', userId);

    if (categories && categories.length > 0) {
      query = query.hasSome('category', categories);
    }

    const results = await query
      .descending('learnedAt')
      .limit(20)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting relevant knowledge:', error);
    return [];
  }
}

// ============================================================================
// Memory Statistics
// ============================================================================

/**
 * Get memory statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Memory statistics
 */
export async function getMemoryStats(userId) {
  try {
    // Get total conversations
    const conversationsResult = await wixData.query(COLLECTIONS.CONVERSATIONS)
      .eq('userId', userId)
      .count();

    // Get total messages
    const messagesResult = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('userId', userId)
      .count();

    // Get knowledge items
    const knowledgeResult = await wixData.query(COLLECTIONS.KNOWLEDGE)
      .eq('userId', userId)
      .count();

    // Get active conversations
    const activeConversationsResult = await wixData.query(COLLECTIONS.CONVERSATIONS)
      .eq('userId', userId)
      .eq('status', 'active')
      .count();

    return {
      totalConversations: conversationsResult,
      totalMessages: messagesResult,
      totalKnowledge: knowledgeResult,
      activeConversations: activeConversationsResult,
      averageMessagesPerConversation: conversationsResult > 0
        ? Math.round(messagesResult / conversationsResult)
        : 0
    };
  } catch (error) {
    console.error('Error getting memory stats:', error);
    throw new Error(`Failed to get memory stats: ${error.message}`);
  }
}

// ============================================================================
// Cleanup Operations
// ============================================================================

/**
 * Clean up old context snapshots
 * @returns {Promise<number>} Number of items removed
 */
export async function cleanupExpiredContexts() {
  try {
    const now = new Date();

    const results = await wixData.query(COLLECTIONS.CONTEXT)
      .lt('expiresAt', now)
      .find();

    let removedCount = 0;
    for (const context of results.items) {
      await wixData.remove(COLLECTIONS.CONTEXT, context._id);
      removedCount++;
    }

    console.log(`Cleaned up ${removedCount} expired context snapshots`);
    return removedCount;
  } catch (error) {
    console.error('Error cleaning up expired contexts:', error);
    throw new Error(`Failed to cleanup contexts: ${error.message}`);
  }
}
