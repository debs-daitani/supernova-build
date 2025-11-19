/**
 * SUPERNova Competitor Tracker - Alert Service
 *
 * Alert management:
 * - Create alerts
 * - Manage alert preferences
 * - Deliver notifications
 * - Track read status
 * - Filter by severity
 */

import wixData from 'wix-data';
import { getCompetitor } from './competitorService';

const COLLECTIONS = {
  ALERTS: 'CompetitorAlerts'
};

const ALERT_TYPES = {
  WEBSITE_CHANGE: 'website_change',
  PRICING_CHANGE: 'pricing_change',
  NEW_PRODUCT: 'new_product',
  NEW_CONTENT: 'new_content',
  SOCIAL_SPIKE: 'social_spike',
  SEO_CHANGE: 'seo_change',
  NEWS: 'news',
  FUNDING: 'funding'
};

const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  IMPORTANT: 'important',
  CRITICAL: 'critical'
};

/**
 * Create an alert
 * @param {string} userId - User ID
 * @param {string} competitorId - Competitor ID
 * @param {Object} alertData - Alert data
 * @returns {Promise<Object>} Created alert
 */
export async function createAlert(userId, competitorId, alertData) {
  try {
    const competitor = await getCompetitor(competitorId);

    const alert = {
      userId,
      competitorId,
      competitorName: competitor.name,
      alertType: alertData.alertType,
      title: alertData.title,
      description: alertData.description,
      data: alertData.data || {},
      severity: alertData.severity || SEVERITY_LEVELS.INFO,
      isRead: false,
      isDismissed: false,
      actionTaken: '',
      createdAt: new Date()
    };

    return await wixData.insert(COLLECTIONS.ALERTS, alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    throw new Error(`Failed to create alert: ${error.message}`);
  }
}

/**
 * Get alerts for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Alerts
 */
export async function getAlerts(userId, filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.ALERTS)
      .eq('userId', userId);

    // Apply filters
    if (filters.unreadOnly) {
      query = query.eq('isRead', false);
    }

    if (filters.competitorId) {
      query = query.eq('competitorId', filters.competitorId);
    }

    if (filters.alertType) {
      query = query.eq('alertType', filters.alertType);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.isDismissed !== undefined) {
      query = query.eq('isDismissed', filters.isDismissed);
    }

    // Sorting
    query = query.descending('createdAt');

    // Limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const results = await query.find();
    return results.items;
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw error;
  }
}

/**
 * Mark alert as read
 * @param {string} alertId - Alert ID
 * @returns {Promise<Object>} Updated alert
 */
export async function markAsRead(alertId) {
  try {
    const alert = await wixData.get(COLLECTIONS.ALERTS, alertId);

    const updated = {
      ...alert,
      isRead: true
    };

    return await wixData.update(COLLECTIONS.ALERTS, updated);
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
}

/**
 * Mark multiple alerts as read
 * @param {Array<string>} alertIds - Alert IDs
 * @returns {Promise<Array>} Updated alerts
 */
export async function markMultipleAsRead(alertIds) {
  try {
    const updates = [];

    for (const alertId of alertIds) {
      const updated = await markAsRead(alertId);
      updates.push(updated);
    }

    return updates;
  } catch (error) {
    console.error('Error marking multiple alerts as read:', error);
    throw error;
  }
}

/**
 * Dismiss alert
 * @param {string} alertId - Alert ID
 * @returns {Promise<Object>} Updated alert
 */
export async function dismissAlert(alertId) {
  try {
    const alert = await wixData.get(COLLECTIONS.ALERTS, alertId);

    const updated = {
      ...alert,
      isDismissed: true,
      isRead: true
    };

    return await wixData.update(COLLECTIONS.ALERTS, updated);
  } catch (error) {
    console.error('Error dismissing alert:', error);
    throw error;
  }
}

/**
 * Add action note to alert
 * @param {string} alertId - Alert ID
 * @param {string} actionNote - Action taken note
 * @returns {Promise<Object>} Updated alert
 */
export async function addActionNote(alertId, actionNote) {
  try {
    const alert = await wixData.get(COLLECTIONS.ALERTS, alertId);

    const updated = {
      ...alert,
      actionTaken: actionNote,
      isRead: true
    };

    return await wixData.update(COLLECTIONS.ALERTS, updated);
  } catch (error) {
    console.error('Error adding action note:', error);
    throw error;
  }
}

/**
 * Get unread alert count
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
  try {
    const results = await wixData.query(COLLECTIONS.ALERTS)
      .eq('userId', userId)
      .eq('isRead', false)
      .eq('isDismissed', false)
      .count();

    return results;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get alert statistics
 * @param {string} userId - User ID
 * @param {number} daysBack - Days to look back
 * @returns {Promise<Object>} Alert statistics
 */
export async function getAlertStats(userId, daysBack = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const results = await wixData.query(COLLECTIONS.ALERTS)
      .eq('userId', userId)
      .ge('createdAt', cutoffDate)
      .find();

    const stats = {
      total: results.items.length,
      unread: 0,
      byType: {},
      bySeverity: {},
      byCompetitor: {}
    };

    results.items.forEach(alert => {
      if (!alert.isRead) {
        stats.unread++;
      }

      // Count by type
      stats.byType[alert.alertType] =
        (stats.byType[alert.alertType] || 0) + 1;

      // Count by severity
      stats.bySeverity[alert.severity] =
        (stats.bySeverity[alert.severity] || 0) + 1;

      // Count by competitor
      stats.byCompetitor[alert.competitorName] =
        (stats.byCompetitor[alert.competitorName] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting alert stats:', error);
    throw error;
  }
}

/**
 * Delete old alerts
 * @param {string} userId - User ID
 * @param {number} daysOld - Delete alerts older than this many days
 * @returns {Promise<number>} Number of deleted alerts
 */
export async function deleteOldAlerts(userId, daysOld = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const results = await wixData.query(COLLECTIONS.ALERTS)
      .eq('userId', userId)
      .lt('createdAt', cutoffDate)
      .eq('isRead', true)
      .find();

    let deleted = 0;

    for (const alert of results.items) {
      await wixData.remove(COLLECTIONS.ALERTS, alert._id);
      deleted++;
    }

    return deleted;
  } catch (error) {
    console.error('Error deleting old alerts:', error);
    throw error;
  }
}

/**
 * Get recent critical alerts
 * @param {string} userId - User ID
 * @param {number} limit - Number of alerts
 * @returns {Promise<Array>} Critical alerts
 */
export async function getCriticalAlerts(userId, limit = 10) {
  try {
    const results = await wixData.query(COLLECTIONS.ALERTS)
      .eq('userId', userId)
      .eq('severity', SEVERITY_LEVELS.CRITICAL)
      .eq('isDismissed', false)
      .descending('createdAt')
      .limit(limit)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting critical alerts:', error);
    throw error;
  }
}

export default {
  createAlert,
  getAlerts,
  markAsRead,
  markMultipleAsRead,
  dismissAlert,
  addActionNote,
  getUnreadCount,
  getAlertStats,
  deleteOldAlerts,
  getCriticalAlerts,
  ALERT_TYPES,
  SEVERITY_LEVELS
};
