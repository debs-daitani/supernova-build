/**
 * SUPERNova Competitor Tracker - Monitoring Service
 *
 * Orchestrates automated monitoring:
 * - Runs scheduled checks
 * - Coordinates different monitoring types
 * - Creates snapshots
 * - Detects changes
 * - Triggers alerts
 */

import wixData from 'wix-data';
import { getCompetitorsForMonitoring, updateLastMonitored } from './competitorService';
import { createAlert } from './competitorAlertService';

const COLLECTIONS = {
  SNAPSHOTS: 'CompetitorSnapshots'
};

const SNAPSHOT_TYPES = {
  WEBSITE: 'website',
  PRICING: 'pricing',
  PRODUCT: 'product',
  SOCIAL: 'social',
  SEO: 'seo',
  CONTENT: 'content'
};

const SIGNIFICANCE_LEVELS = {
  MINOR: 'minor',
  MEDIUM: 'medium',
  IMPORTANT: 'important',
  CRITICAL: 'critical'
};

/**
 * Run monitoring for all enabled competitors
 * @param {string} userId - Optional user ID to limit scope
 * @returns {Promise<Object>} Monitoring results
 */
export async function runMonitoring(userId = null) {
  try {
    const competitors = await getCompetitorsForMonitoring(userId);

    const results = {
      total: competitors.length,
      success: 0,
      failed: 0,
      changes: 0,
      alerts: 0,
      details: []
    };

    for (const competitor of competitors) {
      try {
        const result = await monitorCompetitor(competitor._id);

        results.success++;
        results.changes += result.changes;
        results.alerts += result.alerts;
        results.details.push({
          competitorId: competitor._id,
          name: competitor.name,
          ...result
        });

        // Update last monitored timestamp
        await updateLastMonitored(competitor._id);
      } catch (error) {
        console.error(`Error monitoring ${competitor.name}:`, error);
        results.failed++;
        results.details.push({
          competitorId: competitor._id,
          name: competitor.name,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error running monitoring:', error);
    throw error;
  }
}

/**
 * Monitor a specific competitor
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
export async function monitorCompetitor(competitorId) {
  try {
    const monitoringTasks = [
      monitorWebsite(competitorId),
      monitorPricing(competitorId),
      monitorProducts(competitorId),
      monitorSocial(competitorId),
      monitorContent(competitorId)
    ];

    const results = await Promise.allSettled(monitoringTasks);

    let changes = 0;
    let alerts = 0;

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        changes += result.value.changes || 0;
        alerts += result.value.alerts || 0;
      }
    });

    return { changes, alerts };
  } catch (error) {
    console.error('Error monitoring competitor:', error);
    throw error;
  }
}

/**
 * Monitor competitor website
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
async function monitorWebsite(competitorId) {
  // This would be implemented in competitorWebsiteService.js
  // For now, return placeholder
  return { changes: 0, alerts: 0 };
}

/**
 * Monitor competitor pricing
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
async function monitorPricing(competitorId) {
  // This would be implemented in competitorPricingService.js
  // For now, return placeholder
  return { changes: 0, alerts: 0 };
}

/**
 * Monitor competitor products
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
async function monitorProducts(competitorId) {
  // This would be implemented in competitorProductService.js
  // For now, return placeholder
  return { changes: 0, alerts: 0 };
}

/**
 * Monitor competitor social media
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
async function monitorSocial(competitorId) {
  // This would be implemented in competitorSocialService.js
  // For now, return placeholder
  return { changes: 0, alerts: 0 };
}

/**
 * Monitor competitor content
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
async function monitorContent(competitorId) {
  // This would be implemented in competitorContentService.js
  // For now, return placeholder
  return { changes: 0, alerts: 0 };
}

/**
 * Create a snapshot
 * @param {string} competitorId - Competitor ID
 * @param {string} snapshotType - Snapshot type
 * @param {Object} data - Snapshot data
 * @param {Object} changes - Detected changes
 * @returns {Promise<Object>} Created snapshot
 */
export async function createSnapshot(competitorId, snapshotType, data, changes = {}) {
  try {
    const hasChanges = Object.keys(changes).length > 0;
    const significance = hasChanges ? assessSignificance(snapshotType, changes) : SIGNIFICANCE_LEVELS.MINOR;

    const snapshot = {
      competitorId,
      snapshotType,
      data,
      changes,
      hasChanges,
      significance,
      capturedAt: new Date()
    };

    return await wixData.insert(COLLECTIONS.SNAPSHOTS, snapshot);
  } catch (error) {
    console.error('Error creating snapshot:', error);
    throw error;
  }
}

/**
 * Get latest snapshot of a type
 * @param {string} competitorId - Competitor ID
 * @param {string} snapshotType - Snapshot type
 * @returns {Promise<Object|null>} Latest snapshot or null
 */
export async function getLatestSnapshot(competitorId, snapshotType) {
  try {
    const results = await wixData.query(COLLECTIONS.SNAPSHOTS)
      .eq('competitorId', competitorId)
      .eq('snapshotType', snapshotType)
      .descending('capturedAt')
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting latest snapshot:', error);
    return null;
  }
}

/**
 * Get snapshot history
 * @param {string} competitorId - Competitor ID
 * @param {string} snapshotType - Optional snapshot type filter
 * @param {number} limit - Number of snapshots to return
 * @returns {Promise<Array>} Snapshots
 */
export async function getSnapshotHistory(competitorId, snapshotType = null, limit = 50) {
  try {
    let query = wixData.query(COLLECTIONS.SNAPSHOTS)
      .eq('competitorId', competitorId);

    if (snapshotType) {
      query = query.eq('snapshotType', snapshotType);
    }

    const results = await query
      .descending('capturedAt')
      .limit(limit)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting snapshot history:', error);
    throw error;
  }
}

/**
 * Compare two snapshots
 * @param {Object} oldSnapshot - Old snapshot
 * @param {Object} newSnapshot - New snapshot
 * @returns {Object} Comparison result
 */
export function compareSnapshots(oldSnapshot, newSnapshot) {
  if (!oldSnapshot) {
    return {
      isNew: true,
      changes: {}
    };
  }

  const changes = detectChanges(oldSnapshot.data, newSnapshot.data);

  return {
    isNew: false,
    changes,
    hasChanges: Object.keys(changes).length > 0,
    oldSnapshot,
    newSnapshot
  };
}

/**
 * Detect changes between two data objects
 * @param {Object} oldData - Old data
 * @param {Object} newData - New data
 * @returns {Object} Detected changes
 */
function detectChanges(oldData, newData) {
  const changes = {};

  // Deep comparison
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      if (typeof newData[key] === 'object' && newData[key] !== null) {
        const nestedChanges = detectChanges(oldData[key] || {}, newData[key]);
        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = {
            old: oldData[key],
            new: newData[key],
            nested: nestedChanges
          };
        }
      } else {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }
  }

  // Check for removed keys
  for (const key in oldData) {
    if (!(key in newData)) {
      changes[key] = {
        old: oldData[key],
        new: null,
        removed: true
      };
    }
  }

  return changes;
}

/**
 * Assess significance of changes
 * @param {string} snapshotType - Snapshot type
 * @param {Object} changes - Detected changes
 * @returns {string} Significance level
 */
function assessSignificance(snapshotType, changes) {
  const changeCount = Object.keys(changes).length;

  // Critical changes
  if (snapshotType === SNAPSHOT_TYPES.PRICING && changes.price) {
    return SIGNIFICANCE_LEVELS.CRITICAL;
  }

  if (snapshotType === SNAPSHOT_TYPES.PRODUCT && changes.status === 'new') {
    return SIGNIFICANCE_LEVELS.CRITICAL;
  }

  if (snapshotType === SNAPSHOT_TYPES.SOCIAL && changes.followersChange) {
    const change = Math.abs(changes.followersChange.new || 0);
    if (change > 1000) {
      return SIGNIFICANCE_LEVELS.CRITICAL;
    }
  }

  // Important changes
  if (snapshotType === SNAPSHOT_TYPES.WEBSITE && changes.title) {
    return SIGNIFICANCE_LEVELS.IMPORTANT;
  }

  if (snapshotType === SNAPSHOT_TYPES.SEO && changes.domainAuthority) {
    const change = Math.abs(changes.domainAuthority.new - changes.domainAuthority.old);
    if (change > 5) {
      return SIGNIFICANCE_LEVELS.IMPORTANT;
    }
  }

  // Medium changes
  if (changeCount >= 3) {
    return SIGNIFICANCE_LEVELS.MEDIUM;
  }

  // Minor changes
  return SIGNIFICANCE_LEVELS.MINOR;
}

/**
 * Schedule daily monitoring
 * This would be called by a Wix scheduled job
 */
export async function scheduledDailyMonitoring() {
  console.log('Running scheduled daily monitoring...');

  try {
    const result = await runMonitoring();
    console.log('Daily monitoring complete:', result);
    return result;
  } catch (error) {
    console.error('Error in scheduled monitoring:', error);
    throw error;
  }
}

/**
 * Schedule weekly monitoring (more comprehensive)
 * This would be called by a Wix scheduled job
 */
export async function scheduledWeeklyMonitoring() {
  console.log('Running scheduled weekly monitoring...');

  try {
    // Run full monitoring including SEO checks
    const result = await runMonitoring();

    // Additional weekly tasks could go here
    // - Generate weekly reports
    // - Update traffic estimates
    // - Comprehensive SEO analysis

    console.log('Weekly monitoring complete:', result);
    return result;
  } catch (error) {
    console.error('Error in weekly monitoring:', error);
    throw error;
  }
}

export default {
  runMonitoring,
  monitorCompetitor,
  createSnapshot,
  getLatestSnapshot,
  getSnapshotHistory,
  compareSnapshots,
  detectChanges,
  assessSignificance,
  scheduledDailyMonitoring,
  scheduledWeeklyMonitoring,
  SNAPSHOT_TYPES,
  SIGNIFICANCE_LEVELS
};
