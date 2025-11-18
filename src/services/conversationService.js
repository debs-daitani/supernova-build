/**
 * SUPERNova AI Conversation Service
 *
 * Manages conversations including:
 * - Conversation creation and management
 * - Conversation search and filtering
 * - Conversation summarization
 * - Conversation archival
 */

import wixData from 'wix-data';
import { generateConversationId } from '../utils/helpers';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  CONVERSATIONS: 'SupernovaConversations',
  MESSAGES: 'SupernovaMessages',
  USERS: 'SupernovaUsers'
};

// ============================================================================
// Conversation Operations
// ============================================================================

/**
 * Create a new conversation
 * @param {Object} conversationInput - Conversation data
 * @returns {Promise<Object>} Created conversation
 */
export async function createConversation(conversationInput) {
  try {
    const conversationId = conversationInput.conversationId || generateConversationId();
    const now = new Date();

    const conversation = {
      conversationId,
      userId: conversationInput.userId,
      title: conversationInput.title || 'New Conversation',
      summary: null,
      startedAt: now,
      lastMessageAt: now,
      endedAt: null,
      messageCount: 0,
      status: 'active',
      tags: conversationInput.tags || [],
      sentiment: null,
      metadata: conversationInput.metadata || {},
      context: null,
      isArchived: false
    };

    const result = await wixData.insert(COLLECTIONS.CONVERSATIONS, conversation);

    // Update user conversation count
    updateUserConversationCount(conversationInput.userId, 1).catch(err => {
      console.error('Error updating user conversation count:', err);
    });

    return result;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
}

/**
 * Get conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation object
 */
export async function getConversation(conversationId) {
  try {
    const results = await wixData.query(COLLECTIONS.CONVERSATIONS)
      .eq('conversationId', conversationId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw new Error(`Failed to get conversation: ${error.message}`);
  }
}

/**
 * Get user's conversations
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of conversations
 */
export async function getUserConversations(userId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.CONVERSATIONS)
      .eq('userId', userId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.includeArchived === false) {
      query = query.eq('isArchived', false);
    }

    if (options.tags && options.tags.length > 0) {
      query = query.hasSome('tags', options.tags);
    }

    if (options.startDate) {
      query = query.ge('startedAt', options.startDate);
    }

    if (options.endDate) {
      query = query.le('startedAt', options.endDate);
    }

    const results = await query
      .descending('lastMessageAt')
      .limit(options.limit || 50)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw new Error(`Failed to get conversations: ${error.message}`);
  }
}

/**
 * Search conversations
 * @param {string} userId - User ID
 * @param {string} searchQuery - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching conversations
 */
export async function searchConversations(userId, searchQuery, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.CONVERSATIONS)
      .eq('userId', userId);

    // Search in title and summary
    if (searchQuery) {
      query = query.or(
        wixData.query(COLLECTIONS.CONVERSATIONS).contains('title', searchQuery),
        wixData.query(COLLECTIONS.CONVERSATIONS).contains('summary', searchQuery)
      );
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.tags && options.tags.length > 0) {
      query = query.hasSome('tags', options.tags);
    }

    const results = await query
      .descending('lastMessageAt')
      .limit(options.limit || 50)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw new Error(`Failed to search conversations: ${error.message}`);
  }
}

/**
 * Update conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated conversation
 */
export async function updateConversation(conversationId, updates) {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return await wixData.update(COLLECTIONS.CONVERSATIONS, {
      _id: conversation._id,
      ...updates
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw new Error(`Failed to update conversation: ${error.message}`);
  }
}

/**
 * End a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
export async function endConversation(conversationId) {
  try {
    return await updateConversation(conversationId, {
      status: 'ended',
      endedAt: new Date()
    });
  } catch (error) {
    console.error('Error ending conversation:', error);
    throw new Error(`Failed to end conversation: ${error.message}`);
  }
}

/**
 * Archive a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
export async function archiveConversation(conversationId) {
  try {
    return await updateConversation(conversationId, {
      isArchived: true,
      status: 'archived'
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw new Error(`Failed to archive conversation: ${error.message}`);
  }
}

/**
 * Unarchive a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
export async function unarchiveConversation(conversationId) {
  try {
    return await updateConversation(conversationId, {
      isArchived: false,
      status: 'active'
    });
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    throw new Error(`Failed to unarchive conversation: ${error.message}`);
  }
}

/**
 * Delete a conversation and all its messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteConversation(conversationId) {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Delete all messages in the conversation
    const messages = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('conversationId', conversationId)
      .find();

    let deletedMessages = 0;
    for (const message of messages.items) {
      await wixData.remove(COLLECTIONS.MESSAGES, message._id);
      deletedMessages++;
    }

    // Delete the conversation
    await wixData.remove(COLLECTIONS.CONVERSATIONS, conversation._id);

    // Update user conversation count
    updateUserConversationCount(conversation.userId, -1).catch(err => {
      console.error('Error updating user conversation count:', err);
    });

    return {
      conversationId,
      deletedMessages,
      success: true
    };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}

/**
 * Generate conversation title from first message
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<string>} Generated title
 */
export async function generateConversationTitle(conversationId) {
  try {
    // Get first user message
    const results = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('conversationId', conversationId)
      .eq('role', 'user')
      .ascending('timestamp')
      .limit(1)
      .find();

    if (results.items.length === 0) {
      return 'New Conversation';
    }

    const firstMessage = results.items[0];
    const content = firstMessage.content;

    // Create title from first 50 characters
    let title = content.substring(0, 50);
    if (content.length > 50) {
      title += '...';
    }

    // Update conversation with title
    await updateConversation(conversationId, { title });

    return title;
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return 'New Conversation';
  }
}

/**
 * Add tags to conversation
 * @param {string} conversationId - Conversation ID
 * @param {Array<string>} newTags - Tags to add
 * @returns {Promise<Object>} Updated conversation
 */
export async function addConversationTags(conversationId, newTags) {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const existingTags = conversation.tags || [];
    const uniqueTags = [...new Set([...existingTags, ...newTags])];

    return await updateConversation(conversationId, { tags: uniqueTags });
  } catch (error) {
    console.error('Error adding conversation tags:', error);
    throw new Error(`Failed to add tags: ${error.message}`);
  }
}

/**
 * Remove tags from conversation
 * @param {string} conversationId - Conversation ID
 * @param {Array<string>} tagsToRemove - Tags to remove
 * @returns {Promise<Object>} Updated conversation
 */
export async function removeConversationTags(conversationId, tagsToRemove) {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const existingTags = conversation.tags || [];
    const updatedTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

    return await updateConversation(conversationId, { tags: updatedTags });
  } catch (error) {
    console.error('Error removing conversation tags:', error);
    throw new Error(`Failed to remove tags: ${error.message}`);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update user's total conversation count
 * @param {string} userId - User ID
 * @param {number} increment - Amount to increment (can be negative)
 * @returns {Promise<void>}
 */
async function updateUserConversationCount(userId, increment) {
  try {
    const results = await wixData.query(COLLECTIONS.USERS)
      .eq('userId', userId)
      .find();

    if (results.items.length > 0) {
      const user = results.items[0];
      await wixData.update(COLLECTIONS.USERS, {
        _id: user._id,
        totalConversations: Math.max(0, (user.totalConversations || 0) + increment)
      });
    }
  } catch (error) {
    console.error('Error updating user conversation count:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Get conversation statistics
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Conversation statistics
 */
export async function getConversationStats(conversationId) {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get messages
    const messages = await wixData.query(COLLECTIONS.MESSAGES)
      .eq('conversationId', conversationId)
      .find();

    // Calculate statistics
    const userMessages = messages.items.filter(m => m.role === 'user').length;
    const assistantMessages = messages.items.filter(m => m.role === 'assistant').length;
    const totalTokens = messages.items.reduce((sum, m) => sum + (m.tokenCount || 0), 0);

    const duration = conversation.endedAt
      ? new Date(conversation.endedAt) - new Date(conversation.startedAt)
      : new Date() - new Date(conversation.startedAt);

    return {
      conversationId,
      totalMessages: messages.items.length,
      userMessages,
      assistantMessages,
      totalTokens,
      durationMinutes: Math.round(duration / 60000),
      status: conversation.status,
      tags: conversation.tags || [],
      isArchived: conversation.isArchived
    };
  } catch (error) {
    console.error('Error getting conversation stats:', error);
    throw new Error(`Failed to get conversation stats: ${error.message}`);
  }
}

/**
 * Get user's conversation statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User conversation statistics
 */
export async function getUserConversationStats(userId) {
  try {
    const conversations = await getUserConversations(userId, { limit: 1000 });

    const activeCount = conversations.filter(c => c.status === 'active').length;
    const archivedCount = conversations.filter(c => c.isArchived).length;
    const totalMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);

    return {
      totalConversations: conversations.length,
      activeConversations: activeCount,
      archivedConversations: archivedCount,
      totalMessages,
      averageMessagesPerConversation: conversations.length > 0
        ? Math.round(totalMessages / conversations.length)
        : 0,
      lastConversationDate: conversations.length > 0
        ? conversations[0].lastMessageAt
        : null
    };
  } catch (error) {
    console.error('Error getting user conversation stats:', error);
    throw new Error(`Failed to get user conversation stats: ${error.message}`);
  }
}
