/**
 * SUPERNova Pinterest Integration - Analytics Service
 *
 * Manages Pinterest analytics:
 * - Account analytics
 * - Pin performance
 * - Audience insights
 * - Trends and reports
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getValidAccessToken } from './pinterestAccountService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PINTEREST_ANALYTICS: 'PinterestAnalytics',
  PINTEREST_PINS: 'PinterestPins',
  PINTEREST_BOARDS: 'PinterestBoards'
};

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

// ============================================================================
// Analytics Fetching
// ============================================================================

/**
 * Fetch and store analytics from Pinterest
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Analytics data
 */
export async function fetchAndStoreAnalytics(pinterestAccountId, userId, startDate, endDate) {
  try {
    const accessToken = await getValidAccessToken(userId);

    // Format dates for Pinterest API (YYYY-MM-DD)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch analytics from Pinterest
    const response = await fetch(
      `${PINTEREST_API_BASE}/user_account/analytics?start_date=${startDateStr}&end_date=${endDateStr}&metric_types=IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK,PROFILE_VISIT`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analytics from Pinterest');
    }

    const analyticsData = await response.json();

    const storedAnalytics = [];

    // Store daily analytics
    if (analyticsData.all_time) {
      const metrics = analyticsData.all_time;

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateKey = date.toISOString().split('T')[0];

        // Check if analytics for this date already exist
        const existing = await wixData.query(COLLECTIONS.PINTEREST_ANALYTICS)
          .eq('pinterestAccountId', pinterestAccountId)
          .eq('date', date)
          .find();

        const analyticsRecord = {
          pinterestAccountId,
          date: new Date(date),
          impressions: metrics.IMPRESSION || 0,
          saves: metrics.SAVE || 0,
          clicks: metrics.OUTBOUND_CLICK || 0,
          closeups: metrics.PIN_CLICK || 0,
          profileVisits: metrics.PROFILE_VISIT || 0,
          topPins: [],
          topBoards: [],
          audience: {},
          createdAt: new Date()
        };

        if (existing.items.length > 0) {
          analyticsRecord._id = existing.items[0]._id;
          const updated = await wixData.update(COLLECTIONS.PINTEREST_ANALYTICS, analyticsRecord);
          storedAnalytics.push(updated);
        } else {
          const created = await wixData.insert(COLLECTIONS.PINTEREST_ANALYTICS, analyticsRecord);
          storedAnalytics.push(created);
        }
      }
    }

    return storedAnalytics;
  } catch (error) {
    console.error('Error fetching and storing analytics:', error);
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }
}

/**
 * Get analytics for date range
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Analytics data
 */
export async function getAnalytics(pinterestAccountId, startDate, endDate) {
  try {
    const results = await wixData.query(COLLECTIONS.PINTEREST_ANALYTICS)
      .eq('pinterestAccountId', pinterestAccountId)
      .ge('date', startDate)
      .le('date', endDate)
      .ascending('date')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw new Error(`Failed to get analytics: ${error.message}`);
  }
}

// ============================================================================
// Analytics Aggregation
// ============================================================================

/**
 * Get analytics summary for date range
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Analytics summary
 */
export async function getAnalyticsSummary(pinterestAccountId, startDate, endDate) {
  try {
    const analytics = await getAnalytics(pinterestAccountId, startDate, endDate);

    const summary = {
      totalImpressions: 0,
      totalSaves: 0,
      totalClicks: 0,
      totalCloseups: 0,
      totalProfileVisits: 0,
      avgEngagementRate: 0,
      dailyData: analytics
    };

    analytics.forEach(day => {
      summary.totalImpressions += day.impressions || 0;
      summary.totalSaves += day.saves || 0;
      summary.totalClicks += day.clicks || 0;
      summary.totalCloseups += day.closeups || 0;
      summary.totalProfileVisits += day.profileVisits || 0;
    });

    // Calculate engagement rate
    if (summary.totalImpressions > 0) {
      const totalEngagements = summary.totalSaves + summary.totalClicks + summary.totalCloseups;
      summary.avgEngagementRate = (totalEngagements / summary.totalImpressions) * 100;
    }

    return summary;
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

/**
 * Get top performing pins
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {Object} options - Options
 * @returns {Promise<Array>} Top pins
 */
export async function getTopPins(pinterestAccountId, options = {}) {
  try {
    const limit = options.limit || 10;
    const metric = options.metric || 'impressions'; // impressions, saves, clicks

    let query = wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('pinterestAccountId', pinterestAccountId)
      .eq('status', 'published');

    // Sort by metric
    query = query.descending(metric);

    const results = await query.limit(limit).find();

    return results.items;
  } catch (error) {
    console.error('Error getting top pins:', error);
    throw error;
  }
}

/**
 * Get top performing boards
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {number} limit - Number of boards to return
 * @returns {Promise<Array>} Top boards
 */
export async function getTopBoards(pinterestAccountId, limit = 5) {
  try {
    const boards = await wixData.query(COLLECTIONS.PINTEREST_BOARDS)
      .eq('pinterestAccountId', pinterestAccountId)
      .find();

    const boardsWithStats = await Promise.all(
      boards.items.map(async board => {
        // Get pins for this board
        const pins = await wixData.query(COLLECTIONS.PINTEREST_PINS)
          .eq('boardId', board._id)
          .eq('status', 'published')
          .find();

        const stats = {
          impressions: 0,
          saves: 0,
          clicks: 0
        };

        pins.items.forEach(pin => {
          stats.impressions += pin.impressions || 0;
          stats.saves += pin.saves || 0;
          stats.clicks += pin.clicks || 0;
        });

        return {
          ...board,
          stats
        };
      })
    );

    // Sort by impressions
    boardsWithStats.sort((a, b) => b.stats.impressions - a.stats.impressions);

    return boardsWithStats.slice(0, limit);
  } catch (error) {
    console.error('Error getting top boards:', error);
    throw error;
  }
}

// ============================================================================
// Trends and Insights
// ============================================================================

/**
 * Get growth trends
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Growth trends
 */
export async function getGrowthTrends(pinterestAccountId, days = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await getAnalytics(pinterestAccountId, startDate, endDate);

    if (analytics.length === 0) {
      return {
        impressionsTrend: 0,
        savesTrend: 0,
        clicksTrend: 0,
        engagementTrend: 0
      };
    }

    // Compare first half to second half
    const midpoint = Math.floor(analytics.length / 2);
    const firstHalf = analytics.slice(0, midpoint);
    const secondHalf = analytics.slice(midpoint);

    const firstHalfStats = calculatePeriodStats(firstHalf);
    const secondHalfStats = calculatePeriodStats(secondHalf);

    return {
      impressionsTrend: calculatePercentageChange(firstHalfStats.impressions, secondHalfStats.impressions),
      savesTrend: calculatePercentageChange(firstHalfStats.saves, secondHalfStats.saves),
      clicksTrend: calculatePercentageChange(firstHalfStats.clicks, secondHalfStats.clicks),
      engagementTrend: calculatePercentageChange(firstHalfStats.engagement, secondHalfStats.engagement)
    };
  } catch (error) {
    console.error('Error getting growth trends:', error);
    throw error;
  }
}

/**
 * Calculate stats for a period
 * @param {Array} analytics - Analytics data
 * @returns {Object} Period stats
 */
function calculatePeriodStats(analytics) {
  const stats = {
    impressions: 0,
    saves: 0,
    clicks: 0,
    engagement: 0
  };

  analytics.forEach(day => {
    stats.impressions += day.impressions || 0;
    stats.saves += day.saves || 0;
    stats.clicks += day.clicks || 0;
  });

  stats.engagement = stats.saves + stats.clicks;

  return stats;
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    return newValue > 0 ? 100 : 0;
  }

  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get engagement rate over time
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {number} days - Number of days
 * @returns {Promise<Array>} Engagement rate data
 */
export async function getEngagementRateOverTime(pinterestAccountId, days = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await getAnalytics(pinterestAccountId, startDate, endDate);

    return analytics.map(day => ({
      date: day.date,
      engagementRate: day.impressions > 0
        ? ((day.saves + day.clicks + day.closeups) / day.impressions) * 100
        : 0
    }));
  } catch (error) {
    console.error('Error getting engagement rate over time:', error);
    throw error;
  }
}

/**
 * Get best posting times analysis
 * @param {string} pinterestAccountId - Pinterest account ID
 * @returns {Promise<Object>} Best times analysis
 */
export async function getBestPostingTimes(pinterestAccountId) {
  try {
    // Get all published pins with analytics
    const pins = await wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('pinterestAccountId', pinterestAccountId)
      .eq('status', 'published')
      .find();

    const timeMap = {};

    pins.items.forEach(pin => {
      if (!pin.publishedAt) return;

      const publishDate = new Date(pin.publishedAt);
      const hour = publishDate.getHours();
      const dayOfWeek = publishDate.getDay();

      const key = `${dayOfWeek}-${hour}`;

      if (!timeMap[key]) {
        timeMap[key] = {
          dayOfWeek,
          hour,
          count: 0,
          totalImpressions: 0,
          totalEngagements: 0
        };
      }

      timeMap[key].count++;
      timeMap[key].totalImpressions += pin.impressions || 0;
      timeMap[key].totalEngagements += (pin.saves || 0) + (pin.clicks || 0);
    });

    // Calculate average performance for each time slot
    const analysis = Object.values(timeMap).map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      hour: slot.hour,
      avgImpressions: slot.count > 0 ? slot.totalImpressions / slot.count : 0,
      avgEngagements: slot.count > 0 ? slot.totalEngagements / slot.count : 0,
      sampleSize: slot.count
    }));

    // Sort by average engagements
    analysis.sort((a, b) => b.avgEngagements - a.avgEngagements);

    return analysis.slice(0, 10); // Top 10 times
  } catch (error) {
    console.error('Error getting best posting times:', error);
    throw error;
  }
}

export default {
  fetchAndStoreAnalytics,
  getAnalytics,
  getAnalyticsSummary,
  getTopPins,
  getTopBoards,
  getGrowthTrends,
  getEngagementRateOverTime,
  getBestPostingTimes
};
