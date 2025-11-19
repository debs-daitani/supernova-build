/**
 * SUPERNova Competitor Tracker - SEO Service
 *
 * SEO monitoring:
 * - Track domain authority
 * - Monitor keyword rankings
 * - Analyze backlink profile
 * - Track organic traffic
 * - Identify top pages
 * - Monitor SERP positions
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getCompetitor } from './competitorService';
import { createAlert } from './competitorAlertService';

const COLLECTIONS = {
  SEO: 'CompetitorSEO'
};

/**
 * Monitor competitor SEO
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
export async function monitorSEO(competitorId) {
  try {
    const competitor = await getCompetitor(competitorId);
    const domain = extractDomain(competitor.website);

    // Get previous SEO data
    const previous = await getLatestSEOData(competitorId);

    // Fetch new SEO data
    // In production, this would use SEO APIs (Moz, Ahrefs, SEMrush, etc.)
    const newData = {
      competitorId,
      domain,
      domainAuthority: 0, // Would fetch from API
      domainAuthorityChange: 0,
      organicKeywords: 0,
      organicTraffic: 0,
      organicTrafficChange: 0,
      backlinks: 0,
      backlinksChange: 0,
      referringDomains: 0,
      topRankings: [],
      topBacklinks: [],
      topPages: [],
      capturedAt: new Date()
    };

    // Calculate changes
    if (previous) {
      newData.domainAuthorityChange = newData.domainAuthority - previous.domainAuthority;
      newData.organicTrafficChange = newData.organicTraffic - previous.organicTraffic;
      newData.backlinksChange = newData.backlinks - previous.backlinks;
    }

    // Save data
    await wixData.insert(COLLECTIONS.SEO, newData);

    // Check for significant changes
    let changes = 0;
    let alerts = 0;

    if (newData.domainAuthorityChange !== 0) {
      changes++;

      // Alert for significant DA changes
      if (Math.abs(newData.domainAuthorityChange) >= 5) {
        await createAlert(competitor.userId, competitorId, {
          alertType: 'seo_change',
          title: `${competitor.name}'s domain authority changed`,
          description: `DA ${newData.domainAuthorityChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(newData.domainAuthorityChange)}`,
          data: newData,
          severity: 'important'
        });
        alerts++;
      }
    }

    return { changes, alerts };
  } catch (error) {
    console.error('Error monitoring SEO:', error);
    return { changes: 0, alerts: 0 };
  }
}

/**
 * Extract domain from URL
 * @param {string} url - URL
 * @returns {string} Domain
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url;
  }
}

/**
 * Get latest SEO data
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object|null>} Latest SEO data
 */
async function getLatestSEOData(competitorId) {
  try {
    const results = await wixData.query(COLLECTIONS.SEO)
      .eq('competitorId', competitorId)
      .descending('capturedAt')
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting latest SEO data:', error);
    return null;
  }
}

/**
 * Get SEO history
 * @param {string} competitorId - Competitor ID
 * @param {number} limit - Number of records
 * @returns {Promise<Array>} SEO history
 */
export async function getSEOHistory(competitorId, limit = 30) {
  try {
    const results = await wixData.query(COLLECTIONS.SEO)
      .eq('competitorId', competitorId)
      .descending('capturedAt')
      .limit(limit)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting SEO history:', error);
    throw error;
  }
}

/**
 * Compare SEO metrics across competitors
 * @param {Array<string>} competitorIds - Competitor IDs
 * @returns {Promise<Object>} SEO comparison
 */
export async function compareSEOMetrics(competitorIds) {
  try {
    const comparison = {
      competitors: [],
      leaderboard: {
        domainAuthority: [],
        organicTraffic: [],
        backlinks: []
      }
    };

    for (const competitorId of competitorIds) {
      const competitor = await getCompetitor(competitorId);
      const seoData = await getLatestSEOData(competitorId);

      if (seoData) {
        comparison.competitors.push({
          id: competitorId,
          name: competitor.name,
          ...seoData
        });
      }
    }

    // Create leaderboards
    comparison.leaderboard.domainAuthority = [...comparison.competitors]
      .sort((a, b) => b.domainAuthority - a.domainAuthority)
      .map(c => ({ name: c.name, value: c.domainAuthority }));

    comparison.leaderboard.organicTraffic = [...comparison.competitors]
      .sort((a, b) => b.organicTraffic - a.organicTraffic)
      .map(c => ({ name: c.name, value: c.organicTraffic }));

    comparison.leaderboard.backlinks = [...comparison.competitors]
      .sort((a, b) => b.backlinks - a.backlinks)
      .map(c => ({ name: c.name, value: c.backlinks }));

    return comparison;
  } catch (error) {
    console.error('Error comparing SEO metrics:', error);
    throw error;
  }
}

/**
 * Analyze keyword overlap
 * @param {string} competitorId - Competitor ID
 * @param {Array<string>} yourKeywords - Your target keywords
 * @returns {Promise<Object>} Keyword analysis
 */
export async function analyzeKeywordOverlap(competitorId, yourKeywords = []) {
  try {
    const seoData = await getLatestSEOData(competitorId);

    if (!seoData || !seoData.topRankings) {
      return {
        overlap: [],
        gaps: [],
        opportunities: []
      };
    }

    const competitorKeywords = seoData.topRankings.map(r => r.keyword);

    // Find overlap
    const overlap = yourKeywords.filter(kw =>
      competitorKeywords.includes(kw)
    );

    // Find gaps (keywords they rank for but you don't target)
    const gaps = competitorKeywords.filter(kw =>
      !yourKeywords.includes(kw)
    );

    // Find opportunities (high volume, low difficulty gaps)
    const opportunities = seoData.topRankings
      .filter(ranking =>
        !yourKeywords.includes(ranking.keyword) &&
        ranking.volume > 100 &&
        ranking.difficulty < 50
      )
      .slice(0, 20);

    return {
      overlap,
      gaps: gaps.slice(0, 50),
      opportunities
    };
  } catch (error) {
    console.error('Error analyzing keyword overlap:', error);
    throw error;
  }
}

/**
 * Analyze backlink opportunities
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Backlink opportunities
 */
export async function analyzeBacklinkOpportunities(competitorId) {
  try {
    const seoData = await getLatestSEOData(competitorId);

    if (!seoData || !seoData.topBacklinks) {
      return {
        highQualityLinks: [],
        linkingSites: [],
        opportunities: []
      };
    }

    // Filter for high-quality backlinks
    const highQualityLinks = seoData.topBacklinks
      .filter(link => link.domainAuthority > 50)
      .slice(0, 20);

    // Extract unique linking sites
    const linkingSites = [...new Set(
      seoData.topBacklinks.map(link => link.domain)
    )].slice(0, 50);

    return {
      highQualityLinks,
      linkingSites,
      opportunities: highQualityLinks.map(link => ({
        domain: link.domain,
        url: link.url,
        domainAuthority: link.domainAuthority,
        suggestion: `Reach out to ${link.domain} for similar link opportunity`
      }))
    };
  } catch (error) {
    console.error('Error analyzing backlink opportunities:', error);
    throw error;
  }
}

/**
 * Get traffic estimates
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Traffic estimate
 */
export async function getTrafficEstimate(competitorId) {
  try {
    const seoData = await getLatestSEOData(competitorId);

    if (!seoData) {
      return {
        monthly: 0,
        trend: 'stable',
        sources: {}
      };
    }

    return {
      monthly: seoData.organicTraffic,
      trend: seoData.organicTrafficChange > 0 ? 'growing' :
             seoData.organicTrafficChange < 0 ? 'declining' : 'stable',
      changePercentage: seoData.organicTrafficChange > 0
        ? (seoData.organicTrafficChange / (seoData.organicTraffic - seoData.organicTrafficChange)) * 100
        : 0,
      sources: {
        organic: seoData.organicTraffic,
        // Other sources would be tracked separately
      }
    };
  } catch (error) {
    console.error('Error getting traffic estimate:', error);
    throw error;
  }
}

/**
 * Track SERP positions for keywords
 * @param {string} competitorId - Competitor ID
 * @param {Array<string>} keywords - Keywords to track
 * @returns {Promise<Object>} SERP positions
 */
export async function trackSERPPositions(competitorId, keywords) {
  try {
    const seoData = await getLatestSEOData(competitorId);

    if (!seoData || !seoData.topRankings) {
      return { positions: {} };
    }

    const positions = {};

    keywords.forEach(keyword => {
      const ranking = seoData.topRankings.find(r => r.keyword === keyword);

      positions[keyword] = ranking ? {
        position: ranking.position,
        url: ranking.url,
        volume: ranking.volume
      } : null;
    });

    return { positions };
  } catch (error) {
    console.error('Error tracking SERP positions:', error);
    throw error;
  }
}

export default {
  monitorSEO,
  getSEOHistory,
  compareSEOMetrics,
  analyzeKeywordOverlap,
  analyzeBacklinkOpportunities,
  getTrafficEstimate,
  trackSERPPositions
};
