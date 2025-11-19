/**
 * SUPERNova Competitor Tracker - Content Service
 *
 * Content monitoring:
 * - Track blog posts
 * - Monitor videos
 * - Track podcasts
 * - Monitor webinars
 * - Content frequency analysis
 * - Topic analysis
 * - Engagement tracking
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getCompetitor } from './competitorService';
import { createAlert } from './competitorAlertService';

const COLLECTIONS = {
  CONTENT: 'CompetitorContent'
};

const CONTENT_TYPES = {
  BLOG_POST: 'blog_post',
  VIDEO: 'video',
  PODCAST: 'podcast',
  WEBINAR: 'webinar',
  EBOOK: 'ebook',
  CASE_STUDY: 'case_study',
  WHITEPAPER: 'whitepaper'
};

/**
 * Monitor competitor content
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
export async function monitorContent(competitorId) {
  try {
    const competitor = await getCompetitor(competitorId);

    // In production, this would:
    // 1. Check RSS feeds
    // 2. Scrape blog pages
    // 3. Check YouTube channels
    // 4. Monitor social media for content links

    // For now, return placeholder
    return {
      changes: 0,
      alerts: 0
    };
  } catch (error) {
    console.error('Error monitoring content:', error);
    throw error;
  }
}

/**
 * Add content item
 * @param {string} competitorId - Competitor ID
 * @param {Object} contentData - Content data
 * @returns {Promise<Object>} Created content record
 */
export async function addContent(competitorId, contentData) {
  try {
    // Check if content already exists
    const existing = await getContentByURL(competitorId, contentData.url);

    if (existing) {
      // Update engagement metrics
      return await updateContent(existing._id, {
        engagement: contentData.engagement
      });
    }

    const content = {
      competitorId,
      contentType: contentData.contentType,
      title: contentData.title,
      url: contentData.url,
      author: contentData.author || '',
      publishedAt: contentData.publishedAt || new Date(),
      topic: contentData.topic || '',
      keywords: contentData.keywords || [],
      summary: contentData.summary || '',
      engagement: contentData.engagement || {},
      platform: contentData.platform || '',
      capturedAt: new Date()
    };

    const result = await wixData.insert(COLLECTIONS.CONTENT, content);

    // Create alert for new content
    const competitor = await getCompetitor(competitorId);
    await createAlert(competitor.userId, competitorId, {
      alertType: 'new_content',
      title: `${competitor.name} published new ${contentData.contentType}`,
      description: contentData.title,
      data: { content: result },
      severity: 'info'
    });

    return result;
  } catch (error) {
    console.error('Error adding content:', error);
    throw error;
  }
}

/**
 * Get content by URL
 * @param {string} competitorId - Competitor ID
 * @param {string} url - Content URL
 * @returns {Promise<Object|null>} Content record
 */
async function getContentByURL(competitorId, url) {
  try {
    const results = await wixData.query(COLLECTIONS.CONTENT)
      .eq('competitorId', competitorId)
      .eq('url', url)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting content by URL:', error);
    return null;
  }
}

/**
 * Update content
 * @param {string} contentId - Content ID
 * @param {Object} updates - Updates
 * @returns {Promise<Object>} Updated content
 */
async function updateContent(contentId, updates) {
  try {
    const content = await wixData.get(COLLECTIONS.CONTENT, contentId);

    const updated = {
      ...content,
      ...updates
    };

    return await wixData.update(COLLECTIONS.CONTENT, updated);
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
}

/**
 * Get recent content for competitor
 * @param {string} competitorId - Competitor ID
 * @param {number} limit - Number of items
 * @returns {Promise<Array>} Recent content
 */
export async function getRecentContent(competitorId, limit = 20) {
  try {
    const results = await wixData.query(COLLECTIONS.CONTENT)
      .eq('competitorId', competitorId)
      .descending('publishedAt')
      .limit(limit)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting recent content:', error);
    throw error;
  }
}

/**
 * Analyze content frequency
 * @param {string} competitorId - Competitor ID
 * @param {number} daysBack - Days to analyze
 * @returns {Promise<Object>} Content frequency analysis
 */
export async function analyzeContentFrequency(competitorId, daysBack = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const results = await wixData.query(COLLECTIONS.CONTENT)
      .eq('competitorId', competitorId)
      .ge('publishedAt', cutoffDate)
      .find();

    const analysis = {
      total: results.items.length,
      byType: {},
      byWeek: results.items.length / (daysBack / 7),
      byMonth: results.items.length / (daysBack / 30),
      topTopics: {},
      topAuthors: {}
    };

    results.items.forEach(content => {
      // Count by type
      analysis.byType[content.contentType] =
        (analysis.byType[content.contentType] || 0) + 1;

      // Count by topic
      if (content.topic) {
        analysis.topTopics[content.topic] =
          (analysis.topTopics[content.topic] || 0) + 1;
      }

      // Count by author
      if (content.author) {
        analysis.topAuthors[content.author] =
          (analysis.topAuthors[content.author] || 0) + 1;
      }
    });

    // Sort topics and authors
    analysis.topTopics = Object.entries(analysis.topTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    analysis.topAuthors = Object.entries(analysis.topAuthors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    return analysis;
  } catch (error) {
    console.error('Error analyzing content frequency:', error);
    throw error;
  }
}

/**
 * Compare content strategies
 * @param {Array<string>} competitorIds - Competitor IDs
 * @param {number} daysBack - Days to analyze
 * @returns {Promise<Object>} Content comparison
 */
export async function compareContentStrategies(competitorIds, daysBack = 90) {
  try {
    const comparison = {
      competitors: []
    };

    for (const competitorId of competitorIds) {
      const competitor = await getCompetitor(competitorId);
      const analysis = await analyzeContentFrequency(competitorId, daysBack);

      comparison.competitors.push({
        id: competitorId,
        name: competitor.name,
        ...analysis
      });
    }

    return comparison;
  } catch (error) {
    console.error('Error comparing content strategies:', error);
    throw error;
  }
}

/**
 * Get top performing content
 * @param {string} competitorId - Competitor ID
 * @param {number} limit - Number of items
 * @returns {Promise<Array>} Top performing content
 */
export async function getTopPerformingContent(competitorId, limit = 10) {
  try {
    const results = await wixData.query(COLLECTIONS.CONTENT)
      .eq('competitorId', competitorId)
      .find();

    // Sort by total engagement
    const sorted = results.items.sort((a, b) => {
      const aTotal = calculateTotalEngagement(a.engagement);
      const bTotal = calculateTotalEngagement(b.engagement);
      return bTotal - aTotal;
    });

    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Error getting top performing content:', error);
    throw error;
  }
}

/**
 * Calculate total engagement
 * @param {Object} engagement - Engagement object
 * @returns {number} Total engagement score
 */
function calculateTotalEngagement(engagement) {
  if (!engagement) return 0;

  let total = 0;
  total += (engagement.shares || 0) * 3;  // Weight shares more
  total += (engagement.comments || 0) * 2; // Weight comments more
  total += (engagement.likes || 0);
  total += (engagement.views || 0) * 0.01; // Weight views less

  return total;
}

/**
 * Identify content gaps
 * @param {string} competitorId - Competitor ID
 * @param {Array<string>} yourTopics - Your content topics
 * @returns {Promise<Object>} Content gaps
 */
export async function identifyContentGaps(competitorId, yourTopics = []) {
  try {
    const content = await wixData.query(COLLECTIONS.CONTENT)
      .eq('competitorId', competitorId)
      .find();

    // Collect all competitor topics
    const competitorTopics = new Set();
    content.items.forEach(item => {
      if (item.topic) {
        competitorTopics.add(item.topic);
      }
      item.keywords.forEach(kw => competitorTopics.add(kw));
    });

    // Find topics they cover that you don't
    const gaps = [];
    competitorTopics.forEach(topic => {
      if (!yourTopics.includes(topic)) {
        gaps.push(topic);
      }
    });

    return {
      gaps,
      suggestions: gaps.slice(0, 10) // Top 10 suggestions
    };
  } catch (error) {
    console.error('Error identifying content gaps:', error);
    throw error;
  }
}

export default {
  monitorContent,
  addContent,
  getRecentContent,
  analyzeContentFrequency,
  compareContentStrategies,
  getTopPerformingContent,
  identifyContentGaps,
  CONTENT_TYPES
};
