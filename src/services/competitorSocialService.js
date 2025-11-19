/**
 * SUPERNova Competitor Tracker - Social Media Service
 *
 * Social media monitoring:
 * - Track follower growth
 * - Monitor post frequency
 * - Analyze engagement rates
 * - Track top posts
 * - Monitor hashtag usage
 * - Cross-platform analytics
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getCompetitor } from './competitorService';
import { createAlert } from './competitorAlertService';

const COLLECTIONS = {
  SOCIAL: 'CompetitorSocial'
};

const PLATFORMS = {
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok'
};

/**
 * Monitor competitor social media
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
export async function monitorSocial(competitorId) {
  try {
    const competitor = await getCompetitor(competitorId);
    const socialProfiles = competitor.socialProfiles || {};

    let changes = 0;
    let alerts = 0;

    // Monitor each platform
    for (const [platform, profileUrl] of Object.entries(socialProfiles)) {
      if (!profileUrl) continue;

      try {
        const result = await monitorPlatform(competitorId, platform, profileUrl);
        changes += result.changes;
        alerts += result.alerts;
      } catch (error) {
        console.error(`Error monitoring ${platform}:`, error);
      }
    }

    return { changes, alerts };
  } catch (error) {
    console.error('Error monitoring social media:', error);
    throw error;
  }
}

/**
 * Monitor a specific platform
 * @param {string} competitorId - Competitor ID
 * @param {string} platform - Platform name
 * @param {string} profileUrl - Profile URL
 * @returns {Promise<Object>} Monitoring result
 */
async function monitorPlatform(competitorId, platform, profileUrl) {
  try {
    // Get previous data
    const previous = await getLatestPlatformData(competitorId, platform);

    // Fetch new data (in production, this would use platform APIs)
    // For now, we'll use placeholder logic
    const newData = {
      competitorId,
      platform,
      handle: extractHandle(profileUrl),
      profileUrl,
      followers: 0, // Would fetch from API
      followersChange: 0,
      followersChangePercentage: 0,
      following: 0,
      postCount: 0,
      postFrequency: 0,
      engagementRate: 0,
      recentPosts: [],
      topPosts: [],
      hashtags: [],
      capturedAt: new Date()
    };

    // Calculate changes
    if (previous) {
      newData.followersChange = newData.followers - previous.followers;
      if (previous.followers > 0) {
        newData.followersChangePercentage =
          (newData.followersChange / previous.followers) * 100;
      }
    }

    // Save data
    await wixData.insert(COLLECTIONS.SOCIAL, newData);

    // Check for significant changes
    let changes = 0;
    let alerts = 0;

    if (newData.followersChange !== 0) {
      changes++;

      // Alert for large follower spikes
      if (Math.abs(newData.followersChangePercentage) > 20) {
        const competitor = await getCompetitor(competitorId);
        await createAlert(competitor.userId, competitorId, {
          alertType: 'social_spike',
          title: `${competitor.name}'s ${platform} followers ${newData.followersChange > 0 ? 'increased' : 'decreased'}`,
          description: `${newData.followersChangePercentage.toFixed(1)}% change (${newData.followersChange > 0 ? '+' : ''}${newData.followersChange} followers)`,
          data: newData,
          severity: 'important'
        });
        alerts++;
      }
    }

    return { changes, alerts };
  } catch (error) {
    console.error('Error monitoring platform:', error);
    return { changes: 0, alerts: 0 };
  }
}

/**
 * Extract handle from profile URL
 * @param {string} url - Profile URL
 * @returns {string} Handle
 */
function extractHandle(url) {
  const match = url.match(/(?:twitter|linkedin|instagram|facebook|youtube|tiktok)\.com\/(?:@|company\/|channel\/)?([^/?]+)/i);
  return match ? match[1] : '';
}

/**
 * Get latest platform data
 * @param {string} competitorId - Competitor ID
 * @param {string} platform - Platform name
 * @returns {Promise<Object|null>} Latest data
 */
async function getLatestPlatformData(competitorId, platform) {
  try {
    const results = await wixData.query(COLLECTIONS.SOCIAL)
      .eq('competitorId', competitorId)
      .eq('platform', platform)
      .descending('capturedAt')
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting latest platform data:', error);
    return null;
  }
}

/**
 * Get social media overview for competitor
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Social media overview
 */
export async function getSocialOverview(competitorId) {
  try {
    const overview = {
      platforms: {},
      totalFollowers: 0,
      avgEngagementRate: 0,
      mostActiveplatform: null,
      fastestGrowingPlatform: null
    };

    for (const platform of Object.values(PLATFORMS)) {
      const data = await getLatestPlatformData(competitorId, platform);

      if (data) {
        overview.platforms[platform] = data;
        overview.totalFollowers += data.followers;
      }
    }

    // Calculate averages
    const platformCount = Object.keys(overview.platforms).length;
    if (platformCount > 0) {
      const totalEngagement = Object.values(overview.platforms)
        .reduce((sum, p) => sum + (p.engagementRate || 0), 0);

      overview.avgEngagementRate = totalEngagement / platformCount;

      // Find most active platform
      let maxPosts = 0;
      let maxGrowth = -Infinity;

      Object.entries(overview.platforms).forEach(([platform, data]) => {
        if (data.postFrequency > maxPosts) {
          maxPosts = data.postFrequency;
          overview.mostActivePlatform = platform;
        }

        if (data.followersChangePercentage > maxGrowth) {
          maxGrowth = data.followersChangePercentage;
          overview.fastestGrowingPlatform = platform;
        }
      });
    }

    return overview;
  } catch (error) {
    console.error('Error getting social overview:', error);
    throw error;
  }
}

/**
 * Get follower growth history
 * @param {string} competitorId - Competitor ID
 * @param {string} platform - Platform name
 * @param {number} daysBack - Days to look back
 * @returns {Promise<Array>} Growth history
 */
export async function getFollowerGrowthHistory(competitorId, platform, daysBack = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const results = await wixData.query(COLLECTIONS.SOCIAL)
      .eq('competitorId', competitorId)
      .eq('platform', platform)
      .ge('capturedAt', cutoffDate)
      .ascending('capturedAt')
      .find();

    return results.items.map(item => ({
      date: item.capturedAt,
      followers: item.followers,
      change: item.followersChange,
      changePercentage: item.followersChangePercentage
    }));
  } catch (error) {
    console.error('Error getting follower growth history:', error);
    throw error;
  }
}

/**
 * Compare social media performance
 * @param {Array<string>} competitorIds - Competitor IDs
 * @returns {Promise<Object>} Social comparison
 */
export async function compareSocialPerformance(competitorIds) {
  try {
    const comparison = {
      competitors: []
    };

    for (const competitorId of competitorIds) {
      const competitor = await getCompetitor(competitorId);
      const overview = await getSocialOverview(competitorId);

      comparison.competitors.push({
        id: competitorId,
        name: competitor.name,
        ...overview
      });
    }

    return comparison;
  } catch (error) {
    console.error('Error comparing social performance:', error);
    throw error;
  }
}

/**
 * Analyze posting patterns
 * @param {string} competitorId - Competitor ID
 * @param {string} platform - Platform name
 * @returns {Promise<Object>} Posting pattern analysis
 */
export async function analyzePostingPatterns(competitorId, platform) {
  try {
    const data = await getLatestPlatformData(competitorId, platform);

    if (!data || !data.recentPosts) {
      return {
        avgPostsPerWeek: 0,
        bestPostingTimes: [],
        contentTypes: {},
        hashtagUsage: []
      };
    }

    const analysis = {
      avgPostsPerWeek: data.postFrequency || 0,
      bestPostingTimes: [], // Would analyze post times
      contentTypes: {}, // Would categorize content
      hashtagUsage: data.hashtags || []
    };

    return analysis;
  } catch (error) {
    console.error('Error analyzing posting patterns:', error);
    throw error;
  }
}

/**
 * Get top posts
 * @param {string} competitorId - Competitor ID
 * @param {string} platform - Platform name
 * @returns {Promise<Array>} Top posts
 */
export async function getTopPosts(competitorId, platform) {
  try {
    const data = await getLatestPlatformData(competitorId, platform);

    return data?.topPosts || [];
  } catch (error) {
    console.error('Error getting top posts:', error);
    throw error;
  }
}

export default {
  monitorSocial,
  getSocialOverview,
  getFollowerGrowthHistory,
  compareSocialPerformance,
  analyzePostingPatterns,
  getTopPosts,
  PLATFORMS
};
