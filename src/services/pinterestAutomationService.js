/**
 * SUPERNova Pinterest Integration - Automation Service
 *
 * Manages Pinterest automation:
 * - RSS feed auto-pinning
 * - Repinning automation
 * - Batch operations
 * - Content recycling
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { createPin, publishPin } from './pinterestPinService';
import { addToQueue } from './pinterestSchedulingService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PINTEREST_PINS: 'PinterestPins',
  PINTEREST_BOARDS: 'PinterestBoards'
};

// ============================================================================
// RSS Auto-Pinning
// ============================================================================

/**
 * Fetch and parse RSS feed
 * @param {string} rssFeedUrl - RSS feed URL
 * @returns {Promise<Array>} Array of feed items
 */
async function fetchRSSFeed(rssFeedUrl) {
  try {
    const response = await fetch(rssFeedUrl);
    const xmlText = await response.text();

    // Parse RSS/XML (simplified - in production use proper XML parser)
    const items = [];

    // Extract items using regex (basic implementation)
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

    itemMatches.forEach(itemXml => {
      const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const descriptionMatch = itemXml.match(/<description>(.*?)<\/description>/);
      const imageMatch = itemXml.match(/<media:content.*?url="(.*?)"/) ||
                         itemXml.match(/<enclosure.*?url="(.*?)"/) ||
                         itemXml.match(/<image>(.*?)<\/image>/);

      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
          link: linkMatch[1].trim(),
          description: descriptionMatch ? descriptionMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim() : '',
          imageUrl: imageMatch ? imageMatch[1] : null
        });
      }
    });

    return items;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw new Error(`Failed to fetch RSS feed: ${error.message}`);
  }
}

/**
 * Auto-pin from RSS feed
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {string} rssFeedUrl - RSS feed URL
 * @param {string} boardId - Target board ID
 * @param {Object} options - Auto-pin options
 * @returns {Promise<Array>} Created pins
 */
export async function autoPinFromRSS(pinterestAccountId, rssFeedUrl, boardId, options = {}) {
  try {
    const feedItems = await fetchRSSFeed(rssFeedUrl);

    // Get existing pins to avoid duplicates
    const existingPins = await wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('pinterestAccountId', pinterestAccountId)
      .find();

    const existingLinks = new Set(existingPins.items.map(p => p.link));

    const newPins = [];
    const maxPins = options.maxPins || 5; // Limit how many to create at once

    for (const item of feedItems) {
      if (newPins.length >= maxPins) break;

      // Skip if already pinned
      if (existingLinks.has(item.link)) continue;

      // Skip if no image
      if (!item.imageUrl) continue;

      // Create pin
      const pinData = {
        pinterestAccountId,
        boardId,
        title: item.title.substring(0, 100), // Max 100 chars
        description: item.description.substring(0, 500) || item.title, // Max 500 chars
        link: item.link,
        imageUrl: item.imageUrl,
        altText: item.title
      };

      const pin = await createPin(pinData);
      newPins.push(pin);
    }

    // Auto-schedule if enabled
    if (options.autoSchedule && newPins.length > 0) {
      const pinIds = newPins.map(p => p._id);
      await addToQueue(pinIds, pinterestAccountId);
    }

    return newPins;
  } catch (error) {
    console.error('Error auto-pinning from RSS:', error);
    throw new Error(`Failed to auto-pin from RSS: ${error.message}`);
  }
}

/**
 * Schedule RSS auto-pinning (to be called by cron)
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {string} rssFeedUrl - RSS feed URL
 * @param {string} boardId - Board ID
 * @param {string} frequency - Frequency (daily, weekly)
 * @returns {Promise<Object>} Automation settings
 */
export async function setupRSSAutomation(pinterestAccountId, rssFeedUrl, boardId, frequency = 'daily') {
  try {
    // In production, store this in a separate RSSAutomation collection
    // and process via scheduled background jobs

    const automation = {
      pinterestAccountId,
      rssFeedUrl,
      boardId,
      frequency,
      isActive: true,
      lastRun: null,
      createdAt: new Date()
    };

    // For now, return settings (in production, save to database)
    return automation;
  } catch (error) {
    console.error('Error setting up RSS automation:', error);
    throw error;
  }
}

// ============================================================================
// Repinning Automation
// ============================================================================

/**
 * Get old pins eligible for repinning
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {number} daysOld - Minimum days old
 * @returns {Promise<Array>} Eligible pins
 */
async function getRepinnablePins(pinterestAccountId, daysOld = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const results = await wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('pinterestAccountId', pinterestAccountId)
      .eq('status', 'published')
      .le('publishedAt', cutoffDate)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting repinnable pins:', error);
    throw error;
  }
}

/**
 * Repin old content (create duplicate pin)
 * @param {string} originalPinId - Original pin ID
 * @param {string} newBoardId - New board ID (can be same or different)
 * @returns {Promise<Object>} New pin
 */
export async function repinContent(originalPinId, newBoardId = null) {
  try {
    const originalPin = await wixData.get(COLLECTIONS.PINTEREST_PINS, originalPinId);

    if (!originalPin) {
      throw new Error('Original pin not found');
    }

    // Create new pin with same content
    const newPinData = {
      pinterestAccountId: originalPin.pinterestAccountId,
      boardId: newBoardId || originalPin.boardId,
      title: originalPin.title,
      description: originalPin.description,
      link: originalPin.link,
      imageUrl: originalPin.imageUrl,
      altText: originalPin.altText
    };

    const newPin = await createPin(newPinData);

    return newPin;
  } catch (error) {
    console.error('Error repinning content:', error);
    throw new Error(`Failed to repin: ${error.message}`);
  }
}

/**
 * Auto-repin old content to keep boards fresh
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {Object} options - Repinning options
 * @returns {Promise<Array>} Repinned content
 */
export async function autoRepinOldContent(pinterestAccountId, options = {}) {
  try {
    const daysOld = options.daysOld || 90;
    const maxRepins = options.maxRepins || 3;

    // Get eligible pins
    const eligiblePins = await getRepinnablePins(pinterestAccountId, daysOld);

    if (eligiblePins.length === 0) {
      return [];
    }

    // Select random pins to repin
    const shuffled = eligiblePins.sort(() => 0.5 - Math.random());
    const toRepin = shuffled.slice(0, maxRepins);

    const repinnedPins = [];

    for (const pin of toRepin) {
      try {
        // Optionally rotate between boards
        let targetBoardId = pin.boardId;

        if (options.rotatateBoards) {
          const boards = await wixData.query(COLLECTIONS.PINTEREST_BOARDS)
            .eq('pinterestAccountId', pinterestAccountId)
            .find();

          if (boards.items.length > 1) {
            // Pick a different board
            const otherBoards = boards.items.filter(b => b._id !== pin.boardId);
            if (otherBoards.length > 0) {
              targetBoardId = otherBoards[Math.floor(Math.random() * otherBoards.length)]._id;
            }
          }
        }

        const repinned = await repinContent(pin._id, targetBoardId);
        repinnedPins.push(repinned);
      } catch (error) {
        console.error(`Error repinning pin ${pin._id}:`, error);
        // Continue with other pins
      }
    }

    // Auto-schedule if enabled
    if (options.autoSchedule && repinnedPins.length > 0) {
      const pinIds = repinnedPins.map(p => p._id);
      await addToQueue(pinIds, pinterestAccountId);
    }

    return repinnedPins;
  } catch (error) {
    console.error('Error auto-repinning content:', error);
    throw error;
  }
}

// ============================================================================
// Content Recycling
// ============================================================================

/**
 * Find best performing pins to recycle
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {number} topN - Number of top pins to get
 * @returns {Promise<Array>} Top pins
 */
export async function findTopPerformingPins(pinterestAccountId, topN = 10) {
  try {
    const results = await wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('pinterestAccountId', pinterestAccountId)
      .eq('status', 'published')
      .descending('saves')
      .limit(topN)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error finding top performing pins:', error);
    throw error;
  }
}

/**
 * Recycle top content (repin best performers)
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {Object} options - Recycling options
 * @returns {Promise<Array>} Recycled pins
 */
export async function recycleTopContent(pinterestAccountId, options = {}) {
  try {
    const topN = options.topN || 5;

    // Get top performing pins
    const topPins = await findTopPerformingPins(pinterestAccountId, topN);

    const recycledPins = [];

    for (const pin of topPins) {
      // Check if already recycled recently
      const recentDuplicate = await wixData.query(COLLECTIONS.PINTEREST_PINS)
        .eq('pinterestAccountId', pinterestAccountId)
        .eq('title', pin.title)
        .eq('imageUrl', pin.imageUrl)
        .ge('createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        .find();

      if (recentDuplicate.items.length > 1) {
        continue; // Skip if already recycled recently
      }

      const recycled = await repinContent(pin._id, options.boardId);
      recycledPins.push(recycled);
    }

    // Auto-schedule if enabled
    if (options.autoSchedule && recycledPins.length > 0) {
      const pinIds = recycledPins.map(p => p._id);
      await addToQueue(pinIds, pinterestAccountId);
    }

    return recycledPins;
  } catch (error) {
    console.error('Error recycling top content:', error);
    throw error;
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Bulk repin to multiple boards
 * @param {string} pinId - Pin ID to repin
 * @param {Array} boardIds - Array of board IDs
 * @returns {Promise<Array>} Created pins
 */
export async function bulkRepinToBoards(pinId, boardIds) {
  try {
    const repins = [];

    for (const boardId of boardIds) {
      const repin = await repinContent(pinId, boardId);
      repins.push(repin);
    }

    return repins;
  } catch (error) {
    console.error('Error bulk repinning to boards:', error);
    throw error;
  }
}

export default {
  autoPinFromRSS,
  setupRSSAutomation,
  repinContent,
  autoRepinOldContent,
  findTopPerformingPins,
  recycleTopContent,
  bulkRepinToBoards
};
