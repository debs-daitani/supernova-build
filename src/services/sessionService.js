/**
 * SUPERNova AI Session Service
 *
 * Manages user sessions including:
 * - Session creation and management
 * - Session state tracking
 * - Working memory management
 * - Session expiration and cleanup
 */

import wixData from 'wix-data';
import { generateSessionId, getSessionExpiry } from '../utils/helpers';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  SESSIONS: 'SupernovaSessions',
  USERS: 'SupernovaUsers'
};

const SESSION_CONFIG = {
  DEFAULT_EXPIRY_HOURS: 24,
  WORKING_MEMORY_SIZE: 20,
  CONTEXT_WINDOW_SIZE: 50,
  AUTO_EXTEND: true,
  EXTEND_ON_ACTIVITY_MINUTES: 30
};

// ============================================================================
// Session Operations
// ============================================================================

/**
 * Create a new session
 * @param {Object} sessionInput - Session data
 * @returns {Promise<Object>} Created session
 */
export async function createSession(sessionInput) {
  try {
    const sessionId = sessionInput.sessionId || generateSessionId();
    const now = new Date();
    const expiresAt = getSessionExpiry(sessionInput.expiryHours || SESSION_CONFIG.DEFAULT_EXPIRY_HOURS);

    const session = {
      sessionId,
      userId: sessionInput.userId,
      conversationId: sessionInput.conversationId || null,
      startedAt: now,
      lastActivityAt: now,
      expiresAt,
      status: 'active',
      deviceInfo: sessionInput.deviceInfo || {},
      workingMemory: [],
      contextWindow: [],
      state: sessionInput.state || {},
      metadata: sessionInput.metadata || {}
    };

    const result = await wixData.insert(COLLECTIONS.SESSIONS, session);

    // Update user last active time
    updateUserActivity(sessionInput.userId).catch(err => {
      console.error('Error updating user activity:', err);
    });

    return result;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }
}

/**
 * Get active session for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Active session or null
 */
export async function getActiveSession(userId) {
  try {
    const results = await wixData.query(COLLECTIONS.SESSIONS)
      .eq('userId', userId)
      .eq('status', 'active')
      .descending('lastActivityAt')
      .limit(1)
      .find();

    if (results.items.length === 0) {
      return null;
    }

    const session = results.items[0];

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      await expireSession(session.sessionId);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting active session:', error);
    throw new Error(`Failed to get active session: ${error.message}`);
  }
}

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Session object
 */
export async function getSession(sessionId) {
  try {
    const results = await wixData.query(COLLECTIONS.SESSIONS)
      .eq('sessionId', sessionId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting session:', error);
    throw new Error(`Failed to get session: ${error.message}`);
  }
}

/**
 * Update session activity and optionally extend expiration
 * @param {string} sessionId - Session ID
 * @param {Object} updates - Optional updates
 * @returns {Promise<Object>} Updated session
 */
export async function updateSessionActivity(sessionId, updates = {}) {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const now = new Date();
    const updateData = {
      _id: session._id,
      lastActivityAt: now,
      ...updates
    };

    // Auto-extend expiration if configured
    if (SESSION_CONFIG.AUTO_EXTEND) {
      const extendMinutes = SESSION_CONFIG.EXTEND_ON_ACTIVITY_MINUTES;
      const newExpiry = new Date(now.getTime() + extendMinutes * 60000);

      // Only extend if current expiry is less than new expiry
      if (new Date(session.expiresAt) < newExpiry) {
        updateData.expiresAt = newExpiry;
      }
    }

    return await wixData.update(COLLECTIONS.SESSIONS, updateData);
  } catch (error) {
    console.error('Error updating session activity:', error);
    throw new Error(`Failed to update session: ${error.message}`);
  }
}

/**
 * Update session conversation
 * @param {string} sessionId - Session ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated session
 */
export async function updateSessionConversation(sessionId, conversationId) {
  try {
    return await updateSessionActivity(sessionId, { conversationId });
  } catch (error) {
    console.error('Error updating session conversation:', error);
    throw new Error(`Failed to update session conversation: ${error.message}`);
  }
}

/**
 * Add message to working memory
 * @param {string} sessionId - Session ID
 * @param {Object} message - Message to add
 * @returns {Promise<Object>} Updated session
 */
export async function addToWorkingMemory(sessionId, message) {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Get current working memory
    let workingMemory = session.workingMemory || [];

    // Add new message
    workingMemory.push({
      messageId: message.messageId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      tokenCount: message.tokenCount
    });

    // Keep only the most recent N messages
    if (workingMemory.length > SESSION_CONFIG.WORKING_MEMORY_SIZE) {
      workingMemory = workingMemory.slice(-SESSION_CONFIG.WORKING_MEMORY_SIZE);
    }

    // Update context window (message IDs)
    let contextWindow = session.contextWindow || [];
    contextWindow.push(message.messageId);
    if (contextWindow.length > SESSION_CONFIG.CONTEXT_WINDOW_SIZE) {
      contextWindow = contextWindow.slice(-SESSION_CONFIG.CONTEXT_WINDOW_SIZE);
    }

    return await wixData.update(COLLECTIONS.SESSIONS, {
      _id: session._id,
      workingMemory,
      contextWindow,
      lastActivityAt: new Date()
    });
  } catch (error) {
    console.error('Error adding to working memory:', error);
    throw new Error(`Failed to update working memory: ${error.message}`);
  }
}

/**
 * Update session state
 * @param {string} sessionId - Session ID
 * @param {Object} stateUpdates - State updates
 * @returns {Promise<Object>} Updated session
 */
export async function updateSessionState(sessionId, stateUpdates) {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newState = {
      ...(session.state || {}),
      ...stateUpdates
    };

    return await wixData.update(COLLECTIONS.SESSIONS, {
      _id: session._id,
      state: newState,
      lastActivityAt: new Date()
    });
  } catch (error) {
    console.error('Error updating session state:', error);
    throw new Error(`Failed to update session state: ${error.message}`);
  }
}

/**
 * Get or create session for user
 * @param {string} userId - User ID
 * @param {Object} sessionInput - Session creation data (if needed)
 * @returns {Promise<Object>} Active or new session
 */
export async function getOrCreateSession(userId, sessionInput = {}) {
  try {
    // Check for active session
    let session = await getActiveSession(userId);

    if (session) {
      // Update activity
      session = await updateSessionActivity(session.sessionId);
      return session;
    }

    // Create new session
    return await createSession({
      userId,
      ...sessionInput
    });
  } catch (error) {
    console.error('Error getting or creating session:', error);
    throw new Error(`Failed to get or create session: ${error.message}`);
  }
}

/**
 * End a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Updated session
 */
export async function endSession(sessionId) {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return await wixData.update(COLLECTIONS.SESSIONS, {
      _id: session._id,
      status: 'ended',
      lastActivityAt: new Date()
    });
  } catch (error) {
    console.error('Error ending session:', error);
    throw new Error(`Failed to end session: ${error.message}`);
  }
}

/**
 * Expire a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Updated session
 */
export async function expireSession(sessionId) {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return await wixData.update(COLLECTIONS.SESSIONS, {
      _id: session._id,
      status: 'expired'
    });
  } catch (error) {
    console.error('Error expiring session:', error);
    throw new Error(`Failed to expire session: ${error.message}`);
  }
}

/**
 * Get all sessions for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of sessions
 */
export async function getUserSessions(userId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.SESSIONS)
      .eq('userId', userId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.startDate) {
      query = query.ge('startedAt', options.startDate);
    }

    if (options.endDate) {
      query = query.le('startedAt', options.endDate);
    }

    const results = await query
      .descending('startedAt')
      .limit(options.limit || 50)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    throw new Error(`Failed to get user sessions: ${error.message}`);
  }
}

// ============================================================================
// Cleanup Operations
// ============================================================================

/**
 * Clean up expired sessions
 * @returns {Promise<number>} Number of sessions cleaned up
 */
export async function cleanupExpiredSessions() {
  try {
    const now = new Date();

    // Find all expired sessions that are still marked as active
    const results = await wixData.query(COLLECTIONS.SESSIONS)
      .lt('expiresAt', now)
      .eq('status', 'active')
      .find();

    let cleanedCount = 0;
    for (const session of results.items) {
      await wixData.update(COLLECTIONS.SESSIONS, {
        _id: session._id,
        status: 'expired'
      });
      cleanedCount++;
    }

    console.log(`Cleaned up ${cleanedCount} expired sessions`);
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    throw new Error(`Failed to cleanup sessions: ${error.message}`);
  }
}

/**
 * Delete old sessions (beyond retention period)
 * @param {number} retentionDays - Days to retain sessions
 * @returns {Promise<number>} Number of sessions deleted
 */
export async function deleteOldSessions(retentionDays = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const results = await wixData.query(COLLECTIONS.SESSIONS)
      .lt('startedAt', cutoffDate)
      .ne('status', 'active')
      .find();

    let deletedCount = 0;
    for (const session of results.items) {
      await wixData.remove(COLLECTIONS.SESSIONS, session._id);
      deletedCount++;
    }

    console.log(`Deleted ${deletedCount} old sessions`);
    return deletedCount;
  } catch (error) {
    console.error('Error deleting old sessions:', error);
    throw new Error(`Failed to delete old sessions: ${error.message}`);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update user's last active timestamp
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function updateUserActivity(userId) {
  try {
    const results = await wixData.query(COLLECTIONS.USERS)
      .eq('userId', userId)
      .find();

    if (results.items.length > 0) {
      await wixData.update(COLLECTIONS.USERS, {
        _id: results.items[0]._id,
        lastActiveAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating user activity:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Get session statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Session statistics
 */
export async function getSessionStats(userId) {
  try {
    const allSessions = await getUserSessions(userId, { limit: 1000 });

    const activeSessions = allSessions.filter(s => s.status === 'active').length;
    const totalSessions = allSessions.length;

    let totalDuration = 0;
    for (const session of allSessions) {
      const start = new Date(session.startedAt);
      const end = session.status === 'active'
        ? new Date()
        : new Date(session.lastActivityAt);
      totalDuration += end - start;
    }

    const averageDuration = totalSessions > 0
      ? totalDuration / totalSessions / 60000 // Convert to minutes
      : 0;

    return {
      totalSessions,
      activeSessions,
      averageDurationMinutes: Math.round(averageDuration),
      lastSessionDate: allSessions.length > 0 ? allSessions[0].startedAt : null
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    throw new Error(`Failed to get session stats: ${error.message}`);
  }
}
