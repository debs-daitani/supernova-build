/**
 * SUPERNova Competitor Tracker - Website Service
 *
 * Website monitoring:
 * - Track website changes
 * - Capture screenshots
 * - Monitor key pages
 * - Detect content updates
 * - Identify new features
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getCompetitor } from './competitorService';
import { createSnapshot, getLatestSnapshot } from './competitorMonitoringService';
import { createAlert } from './competitorAlertService';
import crypto from 'crypto';

const COLLECTIONS = {
  WEBSITES: 'CompetitorWebsites'
};

const KEY_PAGES = {
  HOMEPAGE: 'homepage',
  PRICING: 'pricing',
  ABOUT: 'about',
  PRODUCTS: 'products',
  BLOG: 'blog',
  CAREERS: 'careers'
};

/**
 * Monitor competitor website
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
export async function monitorWebsite(competitorId) {
  try {
    const competitor = await getCompetitor(competitorId);

    // Fetch homepage
    const homepageData = await fetchPage(competitor.website);

    // Get previous website data
    const existingWebsite = await getWebsiteData(competitorId);

    // Detect changes
    const changes = detectWebsiteChanges(existingWebsite, homepageData);

    // Update or create website record
    if (existingWebsite) {
      await updateWebsiteData(competitorId, homepageData, changes);
    } else {
      await createWebsiteData(competitorId, homepageData);
    }

    // Create snapshot
    await createSnapshot(competitorId, 'website', homepageData, changes);

    // Create alerts if significant changes
    if (changes.isSignificant) {
      await createAlert(competitor.userId, competitorId, {
        alertType: 'website_change',
        title: `${competitor.name} updated their website`,
        description: changes.summary,
        data: changes,
        severity: changes.severity
      });
    }

    return {
      changes: changes.changeCount,
      alerts: changes.isSignificant ? 1 : 0
    };
  } catch (error) {
    console.error('Error monitoring website:', error);
    throw error;
  }
}

/**
 * Fetch and parse a web page
 * @param {string} url - Page URL
 * @returns {Promise<Object>} Page data
 */
async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorTracker/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    return parsePage(html, url);
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

/**
 * Parse page HTML
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @returns {Object} Parsed page data
 */
function parsePage(html, url) {
  const data = {
    url,
    title: extractTitle(html),
    description: extractDescription(html),
    keywords: extractKeywords(html),
    mainProducts: extractProducts(html),
    pricing: extractPricing(html),
    features: extractFeatures(html),
    ctaText: extractCTA(html),
    contentHash: generateHash(html)
  };

  return data;
}

/**
 * Extract title from HTML
 */
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

/**
 * Extract meta description
 */
function extractDescription(html) {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  return match ? match[1].trim() : '';
}

/**
 * Extract keywords
 */
function extractKeywords(html) {
  const match = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  return match ? match[1].split(',').map(k => k.trim()) : [];
}

/**
 * Extract main products (simplified)
 */
function extractProducts(html) {
  // This is a simplified version
  // In production, this would use more sophisticated extraction
  const products = [];
  const productMatches = html.matchAll(/product[^>]*>([^<]+)</gi);

  for (const match of productMatches) {
    products.push(match[1].trim());
  }

  return products.slice(0, 5); // Top 5
}

/**
 * Extract pricing mentions (simplified)
 */
function extractPricing(html) {
  const pricing = {};

  // Look for price patterns
  const priceMatches = html.matchAll(/[£$€](\d+(?:,\d{3})*(?:\.\d{2})?)/g);

  const prices = [];
  for (const match of priceMatches) {
    prices.push(match[0]);
  }

  if (prices.length > 0) {
    pricing.mentionedPrices = [...new Set(prices)].slice(0, 10);
  }

  return pricing;
}

/**
 * Extract features (simplified)
 */
function extractFeatures(html) {
  // Look for bullet points and feature lists
  const features = [];
  const featureMatches = html.matchAll(/<li[^>]*>([^<]+)</gi);

  for (const match of featureMatches) {
    const text = match[1].trim();
    if (text.length > 10 && text.length < 100) {
      features.push(text);
    }
  }

  return features.slice(0, 10); // Top 10
}

/**
 * Extract primary CTA
 */
function extractCTA(html) {
  // Look for common CTA patterns
  const ctaPatterns = [
    /Get Started/i,
    /Sign Up/i,
    /Try Free/i,
    /Request Demo/i,
    /Contact Us/i,
    /Learn More/i
  ];

  for (const pattern of ctaPatterns) {
    if (pattern.test(html)) {
      const match = html.match(pattern);
      return match[0];
    }
  }

  return '';
}

/**
 * Generate hash of content
 */
function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Get website data for competitor
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object|null>} Website data
 */
export async function getWebsiteData(competitorId) {
  try {
    const results = await wixData.query(COLLECTIONS.WEBSITES)
      .eq('competitorId', competitorId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting website data:', error);
    return null;
  }
}

/**
 * Create website data
 * @param {string} competitorId - Competitor ID
 * @param {Object} data - Website data
 * @returns {Promise<Object>} Created record
 */
async function createWebsiteData(competitorId, data) {
  try {
    const websiteData = {
      competitorId,
      ...data,
      lastChecked: new Date(),
      lastChanged: new Date()
    };

    return await wixData.insert(COLLECTIONS.WEBSITES, websiteData);
  } catch (error) {
    console.error('Error creating website data:', error);
    throw error;
  }
}

/**
 * Update website data
 * @param {string} competitorId - Competitor ID
 * @param {Object} data - New website data
 * @param {Object} changes - Detected changes
 * @returns {Promise<Object>} Updated record
 */
async function updateWebsiteData(competitorId, data, changes) {
  try {
    const existing = await getWebsiteData(competitorId);

    const updated = {
      ...existing,
      ...data,
      lastChecked: new Date()
    };

    if (changes.hasChanges) {
      updated.lastChanged = new Date();
    }

    return await wixData.update(COLLECTIONS.WEBSITES, updated);
  } catch (error) {
    console.error('Error updating website data:', error);
    throw error;
  }
}

/**
 * Detect website changes
 * @param {Object|null} oldData - Previous data
 * @param {Object} newData - New data
 * @returns {Object} Changes detected
 */
function detectWebsiteChanges(oldData, newData) {
  if (!oldData) {
    return {
      hasChanges: false,
      isSignificant: false,
      changeCount: 0,
      changes: {},
      summary: 'Initial website capture'
    };
  }

  const changes = {};
  let changeCount = 0;

  // Check content hash (full page change)
  if (oldData.contentHash !== newData.contentHash) {
    changes.contentChanged = true;
    changeCount++;
  }

  // Check title
  if (oldData.title !== newData.title) {
    changes.title = {
      old: oldData.title,
      new: newData.title
    };
    changeCount++;
  }

  // Check description
  if (oldData.description !== newData.description) {
    changes.description = {
      old: oldData.description,
      new: newData.description
    };
    changeCount++;
  }

  // Check CTA
  if (oldData.ctaText !== newData.ctaText) {
    changes.ctaText = {
      old: oldData.ctaText,
      new: newData.ctaText
    };
    changeCount++;
  }

  // Assess significance
  const isSignificant = changeCount > 0 && (
    changes.title || changes.contentChanged
  );

  // Generate summary
  let summary = '';
  if (changes.title) {
    summary = `Changed title from "${changes.title.old}" to "${changes.title.new}"`;
  } else if (changes.contentChanged) {
    summary = 'Website content has been updated';
  } else if (changes.description) {
    summary = 'Updated meta description';
  }

  return {
    hasChanges: changeCount > 0,
    isSignificant,
    changeCount,
    changes,
    summary,
    severity: isSignificant ? 'important' : 'info'
  };
}

/**
 * Get website change history
 * @param {string} competitorId - Competitor ID
 * @param {number} limit - Number of changes to return
 * @returns {Promise<Array>} Change history
 */
export async function getWebsiteHistory(competitorId, limit = 20) {
  try {
    const snapshots = await getLatestSnapshot(competitorId, 'website');
    return snapshots;
  } catch (error) {
    console.error('Error getting website history:', error);
    throw error;
  }
}

export default {
  monitorWebsite,
  getWebsiteData,
  getWebsiteHistory,
  KEY_PAGES
};
