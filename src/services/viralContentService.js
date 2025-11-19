/**
 * SUPERNova Viral Content Analyzer - Content Service
 *
 * Core viral content management:
 * - CRUD operations for viral content
 * - Calculate engagement metrics
 * - Viral score calculation
 * - Content library management
 */

import wixData from 'wix-data';

const COLLECTIONS = {
  VIRAL_CONTENT: 'ViralContent'
};

const PLATFORMS = {
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  LINKEDIN: 'linkedin',
  FACEBOOK: 'facebook'
};

const CONTENT_TYPES = {
  POST: 'post',
  VIDEO: 'video',
  REEL: 'reel',
  THREAD: 'thread',
  ARTICLE: 'article',
  CAROUSEL: 'carousel',
  STORY: 'story'
};

/**
 * Add viral content to database
 * @param {Object} contentData - Content data
 * @param {string} userId - Optional user ID if saving to personal library
 * @returns {Promise<Object>} Created content record
 */
export async function addViralContent(contentData, userId = null) {
  try {
    // Calculate engagement metrics
    const engagementRate = calculateEngagementRate(contentData);
    const viralScore = calculateViralScore(contentData);

    const content = {
      userId,
      platform: contentData.platform,
      url: contentData.url,
      author: contentData.author || '',
      authorFollowers: contentData.authorFollowers || 0,
      contentType: contentData.contentType,
      title: contentData.title || '',
      caption: contentData.caption || '',
      transcript: contentData.transcript || '',
      hashtags: contentData.hashtags || [],
      mentions: contentData.mentions || [],
      publishedAt: contentData.publishedAt || new Date(),
      discoveredAt: new Date(),
      views: contentData.views || 0,
      likes: contentData.likes || 0,
      comments: contentData.comments || 0,
      shares: contentData.shares || 0,
      saves: contentData.saves || 0,
      engagementRate,
      viralScore,
      topic: contentData.topic || '',
      industry: contentData.industry || '',
      thumbnailUrl: contentData.thumbnailUrl || '',
      analysisData: contentData.analysisData || {},
      isAnalyzed: false,
      isSaved: userId ? true : false,
      createdAt: new Date()
    };

    return await wixData.insert(COLLECTIONS.VIRAL_CONTENT, content);
  } catch (error) {
    console.error('Error adding viral content:', error);
    throw new Error(`Failed to add viral content: ${error.message}`);
  }
}

/**
 * Calculate engagement rate
 * @param {Object} contentData - Content metrics
 * @returns {number} Engagement rate percentage
 */
function calculateEngagementRate(contentData) {
  const { likes = 0, comments = 0, shares = 0, saves = 0, views = 0, authorFollowers = 0 } = contentData;

  // Total engagements
  const totalEngagements = likes + (comments * 2) + (shares * 3) + (saves * 2);

  // Calculate rate based on views if available, otherwise followers
  const base = views > 0 ? views : authorFollowers;

  if (base === 0) return 0;

  return (totalEngagements / base) * 100;
}

/**
 * Calculate viral score (0-100)
 * @param {Object} contentData - Content metrics
 * @returns {number} Viral score
 */
function calculateViralScore(contentData) {
  const {
    views = 0,
    likes = 0,
    comments = 0,
    shares = 0,
    saves = 0,
    authorFollowers = 0,
    publishedAt
  } = contentData;

  let score = 0;

  // Engagement rate component (0-40 points)
  const engagementRate = calculateEngagementRate(contentData);
  score += Math.min(engagementRate * 4, 40);

  // Reach relative to author size (0-20 points)
  if (authorFollowers > 0) {
    const reachRatio = views / authorFollowers;
    score += Math.min(reachRatio * 10, 20);
  }

  // Velocity component (0-20 points)
  if (publishedAt) {
    const hoursSincePublished = (new Date() - new Date(publishedAt)) / (1000 * 60 * 60);
    if (hoursSincePublished > 0) {
      const viewsPerHour = views / hoursSincePublished;
      score += Math.min(viewsPerHour / 100, 20);
    }
  }

  // Quality of engagement (0-20 points)
  const totalEngagements = likes + comments + shares + saves;
  if (totalEngagements > 0) {
    const qualityScore =
      (comments * 0.4 + shares * 0.4 + saves * 0.15 + likes * 0.05) / totalEngagements;
    score += qualityScore * 20;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Get viral content by ID
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Viral content
 */
export async function getViralContent(contentId) {
  try {
    return await wixData.get(COLLECTIONS.VIRAL_CONTENT, contentId);
  } catch (error) {
    console.error('Error getting viral content:', error);
    throw error;
  }
}

/**
 * Get trending viral content
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Trending content
 */
export async function getTrendingContent(filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.VIRAL_CONTENT);

    // Apply filters
    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    if (filters.contentType) {
      query = query.eq('contentType', filters.contentType);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.minViralScore) {
      query = query.ge('viralScore', filters.minViralScore);
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start) query = query.ge('publishedAt', new Date(start));
      if (end) query = query.le('publishedAt', new Date(end));
    }

    // Sort by viral score
    query = query.descending('viralScore');

    // Limit results
    const limit = filters.limit || 20;
    query = query.limit(limit);

    const results = await query.find();
    return results.items;
  } catch (error) {
    console.error('Error getting trending content:', error);
    throw error;
  }
}

/**
 * Search viral content
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Search results
 */
export async function searchViralContent(searchTerm, filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.VIRAL_CONTENT);

    // Apply platform filter if specified
    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    const results = await query.find();

    // Filter by search term
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = results.items.filter(content => {
      return (
        content.title.toLowerCase().includes(lowerSearch) ||
        content.caption.toLowerCase().includes(lowerSearch) ||
        content.author.toLowerCase().includes(lowerSearch) ||
        content.topic.toLowerCase().includes(lowerSearch)
      );
    });

    // Sort by viral score
    filtered.sort((a, b) => b.viralScore - a.viralScore);

    return filtered.slice(0, filters.limit || 20);
  } catch (error) {
    console.error('Error searching viral content:', error);
    throw error;
  }
}

/**
 * Get saved viral content for user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Saved content
 */
export async function getSavedContent(userId, filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.VIRAL_CONTENT)
      .eq('userId', userId)
      .eq('isSaved', true);

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    query = query.descending('createdAt');

    const results = await query.find();
    return results.items;
  } catch (error) {
    console.error('Error getting saved content:', error);
    throw error;
  }
}

/**
 * Update viral content
 * @param {string} contentId - Content ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated content
 */
export async function updateViralContent(contentId, updates) {
  try {
    const content = await getViralContent(contentId);

    const updated = {
      ...content,
      ...updates
    };

    // Recalculate metrics if engagement data changed
    if (updates.views || updates.likes || updates.comments || updates.shares || updates.saves) {
      updated.engagementRate = calculateEngagementRate(updated);
      updated.viralScore = calculateViralScore(updated);
    }

    return await wixData.update(COLLECTIONS.VIRAL_CONTENT, updated);
  } catch (error) {
    console.error('Error updating viral content:', error);
    throw error;
  }
}

/**
 * Delete viral content
 * @param {string} contentId - Content ID
 * @returns {Promise<void>}
 */
export async function deleteViralContent(contentId) {
  try {
    await wixData.remove(COLLECTIONS.VIRAL_CONTENT, contentId);
  } catch (error) {
    console.error('Error deleting viral content:', error);
    throw error;
  }
}

/**
 * Get viral content by URL
 * @param {string} url - Content URL
 * @returns {Promise<Object|null>} Viral content or null
 */
export async function getContentByURL(url) {
  try {
    const results = await wixData.query(COLLECTIONS.VIRAL_CONTENT)
      .eq('url', url)
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting content by URL:', error);
    return null;
  }
}

/**
 * Get content statistics
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Statistics
 */
export async function getContentStats(filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.VIRAL_CONTENT);

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start) query = query.ge('discoveredAt', new Date(start));
      if (end) query = query.le('discoveredAt', new Date(end));
    }

    const results = await query.find();
    const contents = results.items;

    const stats = {
      total: contents.length,
      avgViralScore: 0,
      avgEngagementRate: 0,
      byPlatform: {},
      byContentType: {},
      topPerformers: []
    };

    if (contents.length === 0) return stats;

    // Calculate averages
    const totalViralScore = contents.reduce((sum, c) => sum + c.viralScore, 0);
    const totalEngagementRate = contents.reduce((sum, c) => sum + c.engagementRate, 0);

    stats.avgViralScore = totalViralScore / contents.length;
    stats.avgEngagementRate = totalEngagementRate / contents.length;

    // Count by platform
    contents.forEach(content => {
      stats.byPlatform[content.platform] = (stats.byPlatform[content.platform] || 0) + 1;
      stats.byContentType[content.contentType] = (stats.byContentType[content.contentType] || 0) + 1;
    });

    // Top performers
    stats.topPerformers = contents
      .sort((a, b) => b.viralScore - a.viralScore)
      .slice(0, 10);

    return stats;
  } catch (error) {
    console.error('Error getting content stats:', error);
    throw error;
  }
}

export default {
  addViralContent,
  getViralContent,
  getTrendingContent,
  searchViralContent,
  getSavedContent,
  updateViralContent,
  deleteViralContent,
  getContentByURL,
  getContentStats,
  calculateEngagementRate,
  calculateViralScore,
  PLATFORMS,
  CONTENT_TYPES
};
