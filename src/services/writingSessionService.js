/**
 * SUPERNova Book Writing Suite - Writing Session Service
 *
 * Manages writing sessions and productivity tracking:
 * - Session tracking
 * - Word count goals
 * - Writing streaks
 * - Productivity analytics
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  WRITING_SESSIONS: 'WritingSessions',
  BOOK_PROJECTS: 'BookProjects'
};

// ============================================================================
// Writing Session Operations
// ============================================================================

/**
 * Start a new writing session
 * @param {Object} sessionInput - Session data
 * @returns {Promise<Object>} Created session
 */
export async function startWritingSession(sessionInput) {
  try {
    const session = {
      bookProjectId: sessionInput.bookProjectId,
      userId: sessionInput.userId,
      chapterId: sessionInput.chapterId || null,
      startTime: new Date(),
      endTime: null,
      wordsWritten: 0,
      goalMet: false,
      mood: sessionInput.mood || null,
      notes: '',
      createdAt: new Date()
    };

    const result = await wixData.insert(COLLECTIONS.WRITING_SESSIONS, session);
    return result;
  } catch (error) {
    console.error('Error starting writing session:', error);
    throw new Error(`Failed to start session: ${error.message}`);
  }
}

/**
 * End a writing session
 * @param {string} sessionId - Session ID
 * @param {Object} sessionData - End session data
 * @returns {Promise<Object>} Updated session
 */
export async function endWritingSession(sessionId, sessionData) {
  try {
    const session = await wixData.get(COLLECTIONS.WRITING_SESSIONS, sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...session,
      endTime: new Date(),
      wordsWritten: sessionData.wordsWritten || 0,
      goalMet: sessionData.goalMet || false,
      mood: sessionData.mood || session.mood,
      notes: sessionData.notes || ''
    };

    const result = await wixData.update(COLLECTIONS.WRITING_SESSIONS, updatedSession);
    return result;
  } catch (error) {
    console.error('Error ending writing session:', error);
    throw new Error(`Failed to end session: ${error.message}`);
  }
}

/**
 * Log a completed writing session (retroactive)
 * @param {Object} sessionInput - Session data
 * @returns {Promise<Object>} Created session
 */
export async function logWritingSession(sessionInput) {
  try {
    const session = {
      bookProjectId: sessionInput.bookProjectId,
      userId: sessionInput.userId,
      chapterId: sessionInput.chapterId || null,
      startTime: sessionInput.startTime,
      endTime: sessionInput.endTime,
      wordsWritten: sessionInput.wordsWritten || 0,
      goalMet: sessionInput.goalMet || false,
      mood: sessionInput.mood || null,
      notes: sessionInput.notes || '',
      createdAt: new Date()
    };

    const result = await wixData.insert(COLLECTIONS.WRITING_SESSIONS, session);
    return result;
  } catch (error) {
    console.error('Error logging writing session:', error);
    throw new Error(`Failed to log session: ${error.message}`);
  }
}

/**
 * Get writing sessions for a project
 * @param {string} bookProjectId - Book project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of sessions
 */
export async function getWritingSessions(bookProjectId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('bookProjectId', bookProjectId);

    if (options.startDate) {
      query = query.ge('startTime', options.startDate);
    }

    if (options.endDate) {
      query = query.le('startTime', options.endDate);
    }

    if (options.chapterId) {
      query = query.eq('chapterId', options.chapterId);
    }

    const results = await query
      .descending('startTime')
      .limit(options.limit || 100)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting writing sessions:', error);
    throw new Error(`Failed to get sessions: ${error.message}`);
  }
}

/**
 * Get user's writing sessions across all projects
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of sessions
 */
export async function getUserWritingSessions(userId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('userId', userId);

    if (options.startDate) {
      query = query.ge('startTime', options.startDate);
    }

    if (options.endDate) {
      query = query.le('startTime', options.endDate);
    }

    const results = await query
      .descending('startTime')
      .limit(options.limit || 100)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting user writing sessions:', error);
    throw new Error(`Failed to get sessions: ${error.message}`);
  }
}

/**
 * Get today's writing statistics
 * @param {string} bookProjectId - Book project ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Today's stats
 */
export async function getTodayStats(bookProjectId, userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('bookProjectId', bookProjectId)
      .eq('userId', userId)
      .ge('startTime', today)
      .lt('startTime', tomorrow)
      .find();

    const totalWords = sessions.items.reduce((sum, session) => {
      return sum + (session.wordsWritten || 0);
    }, 0);

    const totalMinutes = sessions.items.reduce((sum, session) => {
      if (session.startTime && session.endTime) {
        const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60);
        return sum + duration;
      }
      return sum;
    }, 0);

    return {
      date: today,
      sessionsCount: sessions.items.length,
      totalWords,
      totalMinutes: Math.round(totalMinutes),
      goalMet: sessions.items.some(s => s.goalMet)
    };
  } catch (error) {
    console.error('Error getting today stats:', error);
    throw new Error(`Failed to get today stats: ${error.message}`);
  }
}

/**
 * Get writing statistics for a date range
 * @param {string} bookProjectId - Book project ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Statistics
 */
export async function getDateRangeStats(bookProjectId, startDate, endDate) {
  try {
    const sessions = await wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('bookProjectId', bookProjectId)
      .ge('startTime', startDate)
      .le('startTime', endDate)
      .find();

    const totalWords = sessions.items.reduce((sum, session) => {
      return sum + (session.wordsWritten || 0);
    }, 0);

    const totalMinutes = sessions.items.reduce((sum, session) => {
      if (session.startTime && session.endTime) {
        const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60);
        return sum + duration;
      }
      return sum;
    }, 0);

    // Group by date
    const dailyStats = new Map();

    sessions.items.forEach(session => {
      const dateKey = new Date(session.startTime).toDateString();

      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, {
          date: dateKey,
          sessions: 0,
          words: 0,
          minutes: 0
        });
      }

      const dayData = dailyStats.get(dateKey);
      dayData.sessions++;
      dayData.words += session.wordsWritten || 0;

      if (session.startTime && session.endTime) {
        const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60);
        dayData.minutes += duration;
      }
    });

    const daysWithSessions = dailyStats.size;
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return {
      totalSessions: sessions.items.length,
      totalWords,
      totalMinutes: Math.round(totalMinutes),
      daysWithSessions,
      totalDays,
      avgWordsPerDay: daysWithSessions > 0 ? Math.round(totalWords / totalDays) : 0,
      avgWordsPerSession: sessions.items.length > 0 ? Math.round(totalWords / sessions.items.length) : 0,
      dailyBreakdown: Array.from(dailyStats.values())
    };
  } catch (error) {
    console.error('Error getting date range stats:', error);
    throw new Error(`Failed to get stats: ${error.message}`);
  }
}

/**
 * Get writing calendar data
 * @param {string} userId - User ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Array>} Calendar data
 */
export async function getWritingCalendar(userId, year, month) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('userId', userId)
      .ge('startTime', startDate)
      .le('startTime', endDate)
      .find();

    // Group by date
    const calendar = new Map();

    sessions.items.forEach(session => {
      const date = new Date(session.startTime);
      const day = date.getDate();

      if (!calendar.has(day)) {
        calendar.set(day, {
          day,
          sessions: 0,
          words: 0,
          goalMet: false
        });
      }

      const dayData = calendar.get(day);
      dayData.sessions++;
      dayData.words += session.wordsWritten || 0;
      dayData.goalMet = dayData.goalMet || session.goalMet;
    });

    return Array.from(calendar.values()).sort((a, b) => a.day - b.day);
  } catch (error) {
    console.error('Error getting writing calendar:', error);
    throw new Error(`Failed to get calendar: ${error.message}`);
  }
}

/**
 * Delete writing session
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteWritingSession(sessionId) {
  try {
    await wixData.remove(COLLECTIONS.WRITING_SESSIONS, sessionId);
    return true;
  } catch (error) {
    console.error('Error deleting writing session:', error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Get productivity insights
 * @param {string} userId - User ID
 * @param {string} bookProjectId - Optional book project ID
 * @returns {Promise<Object>} Insights
 */
export async function getProductivityInsights(userId, bookProjectId = null) {
  try {
    // Get last 90 days of sessions
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    let query = wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('userId', userId)
      .ge('startTime', ninetyDaysAgo);

    if (bookProjectId) {
      query = query.eq('bookProjectId', bookProjectId);
    }

    const sessions = await query.find();

    if (sessions.items.length === 0) {
      return {
        bestTimeOfDay: null,
        mostProductiveDayOfWeek: null,
        averageSessionLength: 0,
        totalProductiveDays: 0
      };
    }

    // Analyze time of day
    const timeOfDayMap = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const dayOfWeekMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let totalDuration = 0;

    sessions.items.forEach(session => {
      const startTime = new Date(session.startTime);
      const hour = startTime.getHours();

      // Categorize time of day
      if (hour >= 5 && hour < 12) {
        timeOfDayMap.morning += session.wordsWritten || 0;
      } else if (hour >= 12 && hour < 17) {
        timeOfDayMap.afternoon += session.wordsWritten || 0;
      } else if (hour >= 17 && hour < 21) {
        timeOfDayMap.evening += session.wordsWritten || 0;
      } else {
        timeOfDayMap.night += session.wordsWritten || 0;
      }

      // Track day of week
      const dayOfWeek = startTime.getDay();
      dayOfWeekMap[dayOfWeek] += session.wordsWritten || 0;

      // Calculate duration
      if (session.endTime) {
        const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60);
        totalDuration += duration;
      }
    });

    // Find best time of day
    const bestTimeOfDay = Object.keys(timeOfDayMap).reduce((a, b) =>
      timeOfDayMap[a] > timeOfDayMap[b] ? a : b
    );

    // Find most productive day
    const mostProductiveDayNum = Object.keys(dayOfWeekMap).reduce((a, b) =>
      dayOfWeekMap[a] > dayOfWeekMap[b] ? a : b
    );

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostProductiveDayOfWeek = daysOfWeek[mostProductiveDayNum];

    const averageSessionLength = sessions.items.length > 0
      ? Math.round(totalDuration / sessions.items.length)
      : 0;

    // Count unique days with sessions
    const uniqueDays = new Set(sessions.items.map(s =>
      new Date(s.startTime).toDateString()
    ));

    return {
      bestTimeOfDay,
      mostProductiveDayOfWeek,
      averageSessionLength,
      totalProductiveDays: uniqueDays.size,
      timeOfDayBreakdown: timeOfDayMap,
      dayOfWeekBreakdown: dayOfWeekMap
    };
  } catch (error) {
    console.error('Error getting productivity insights:', error);
    throw new Error(`Failed to get insights: ${error.message}`);
  }
}

export default {
  startWritingSession,
  endWritingSession,
  logWritingSession,
  getWritingSessions,
  getUserWritingSessions,
  getTodayStats,
  getDateRangeStats,
  getWritingCalendar,
  deleteWritingSession,
  getProductivityInsights
};
