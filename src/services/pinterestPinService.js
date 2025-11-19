/**
 * SUPERNova Pinterest Integration - Pin Service
 *
 * Manages Pinterest pins:
 * - Pin creation and editing
 * - Publishing to Pinterest
 * - Draft management
 * - Bulk operations
 * - Pin analytics
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getValidAccessToken, getPinterestAccount } from './pinterestAccountService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PINTEREST_PINS: 'PinterestPins',
  PINTEREST_BOARDS: 'PinterestBoards'
};

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

// ============================================================================
// Pin Operations
// ============================================================================

/**
 * Create a new pin (draft)
 * @param {Object} pinInput - Pin data
 * @returns {Promise<Object>} Created pin
 */
export async function createPin(pinInput) {
  try {
    const now = new Date();

    const pin = {
      pinterestAccountId: pinInput.pinterestAccountId,
      boardId: pinInput.boardId,
      pinId: null,
      title: pinInput.title,
      description: pinInput.description || '',
      link: pinInput.link || null,
      imageUrl: pinInput.imageUrl,
      altText: pinInput.altText || '',
      status: 'draft',
      scheduledFor: pinInput.scheduledFor || null,
      publishedAt: null,
      impressions: 0,
      saves: 0,
      clicks: 0,
      closeups: 0,
      errorMessage: null,
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.PINTEREST_PINS, pin);
    return result;
  } catch (error) {
    console.error('Error creating pin:', error);
    throw new Error(`Failed to create pin: ${error.message}`);
  }
}

/**
 * Get pin by ID
 * @param {string} pinId - Pin ID
 * @returns {Promise<Object|null>} Pin object
 */
export async function getPin(pinId) {
  try {
    const pin = await wixData.get(COLLECTIONS.PINTEREST_PINS, pinId);
    return pin;
  } catch (error) {
    console.error('Error getting pin:', error);
    throw new Error(`Failed to get pin: ${error.message}`);
  }
}

/**
 * Get pins for a Pinterest account
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of pins
 */
export async function getPins(pinterestAccountId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('pinterestAccountId', pinterestAccountId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.boardId) {
      query = query.eq('boardId', options.boardId);
    }

    if (options.startDate) {
      query = query.ge('createdAt', options.startDate);
    }

    if (options.endDate) {
      query = query.le('createdAt', options.endDate);
    }

    const results = await query
      .descending('createdAt')
      .limit(options.limit || 100)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting pins:', error);
    throw new Error(`Failed to get pins: ${error.message}`);
  }
}

/**
 * Update pin
 * @param {string} pinId - Pin ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated pin
 */
export async function updatePin(pinId, updates) {
  try {
    const pin = await getPin(pinId);
    if (!pin) {
      throw new Error('Pin not found');
    }

    const updatedPin = {
      ...pin,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PINTEREST_PINS, updatedPin);
    return result;
  } catch (error) {
    console.error('Error updating pin:', error);
    throw new Error(`Failed to update pin: ${error.message}`);
  }
}

/**
 * Delete pin
 * @param {string} pinId - Pin ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePin(pinId) {
  try {
    const pin = await getPin(pinId);

    // If pin is published on Pinterest, delete it there too
    if (pin.pinId && pin.status === 'published') {
      try {
        await deletePinFromPinterest(pin);
      } catch (error) {
        console.error('Error deleting from Pinterest:', error);
        // Continue to delete local record even if Pinterest deletion fails
      }
    }

    await wixData.remove(COLLECTIONS.PINTEREST_PINS, pinId);
    return true;
  } catch (error) {
    console.error('Error deleting pin:', error);
    throw new Error(`Failed to delete pin: ${error.message}`);
  }
}

// ============================================================================
// Publishing to Pinterest
// ============================================================================

/**
 * Publish pin to Pinterest immediately
 * @param {string} pinId - Pin ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Published pin
 */
export async function publishPin(pinId, userId) {
  try {
    const pin = await getPin(pinId);
    if (!pin) {
      throw new Error('Pin not found');
    }

    if (pin.status === 'published') {
      throw new Error('Pin already published');
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(userId);

    // Get board details
    const board = await wixData.get(COLLECTIONS.PINTEREST_BOARDS, pin.boardId);

    // Create pin on Pinterest
    const pinterestPinData = {
      board_id: board.boardId,
      title: pin.title,
      description: pin.description,
      link: pin.link,
      media_source: {
        source_type: 'image_url',
        url: pin.imageUrl
      },
      alt_text: pin.altText
    };

    const response = await fetch(`${PINTEREST_API_BASE}/pins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pinterestPinData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to publish pin');
    }

    const publishedPinData = await response.json();

    // Update local pin record
    pin.pinId = publishedPinData.id;
    pin.status = 'published';
    pin.publishedAt = new Date();
    pin.errorMessage = null;
    pin.updatedAt = new Date();

    const result = await wixData.update(COLLECTIONS.PINTEREST_PINS, pin);
    return result;
  } catch (error) {
    console.error('Error publishing pin:', error);

    // Update pin status to failed
    try {
      await updatePin(pinId, {
        status: 'failed',
        errorMessage: error.message
      });
    } catch (updateError) {
      console.error('Error updating failed pin:', updateError);
    }

    throw new Error(`Failed to publish pin: ${error.message}`);
  }
}

/**
 * Schedule pin for later publication
 * @param {string} pinId - Pin ID
 * @param {Date} scheduledTime - When to publish
 * @returns {Promise<Object>} Scheduled pin
 */
export async function schedulePin(pinId, scheduledTime) {
  try {
    return await updatePin(pinId, {
      status: 'scheduled',
      scheduledFor: scheduledTime
    });
  } catch (error) {
    console.error('Error scheduling pin:', error);
    throw new Error(`Failed to schedule pin: ${error.message}`);
  }
}

/**
 * Process scheduled pins (called by cron job)
 * @returns {Promise<Array>} Published pins
 */
export async function processScheduledPins() {
  try {
    const now = new Date();

    // Get all scheduled pins that are due
    const results = await wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('status', 'scheduled')
      .le('scheduledFor', now)
      .find();

    const publishedPins = [];

    for (const pin of results.items) {
      try {
        // Get Pinterest account for this pin
        const account = await wixData.get('PinterestAccounts', pin.pinterestAccountId);

        // Publish the pin
        const published = await publishPin(pin._id, account.userId);
        publishedPins.push(published);
      } catch (error) {
        console.error(`Error publishing scheduled pin ${pin._id}:`, error);
        // Mark as failed
        await updatePin(pin._id, {
          status: 'failed',
          errorMessage: error.message
        });
      }
    }

    return publishedPins;
  } catch (error) {
    console.error('Error processing scheduled pins:', error);
    throw error;
  }
}

/**
 * Delete pin from Pinterest
 * @param {Object} pin - Pin object
 * @returns {Promise<boolean>} Success status
 */
async function deletePinFromPinterest(pin) {
  try {
    const account = await wixData.get('PinterestAccounts', pin.pinterestAccountId);
    const accessToken = await getValidAccessToken(account.userId);

    const response = await fetch(`${PINTEREST_API_BASE}/pins/${pin.pinId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting pin from Pinterest:', error);
    throw error;
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Create multiple pins from template
 * @param {Object} template - Pin template
 * @param {Array} images - Array of image URLs
 * @returns {Promise<Array>} Created pins
 */
export async function bulkCreatePins(template, images) {
  try {
    const createdPins = [];

    for (const imageUrl of images) {
      const pinData = {
        ...template,
        imageUrl
      };

      const pin = await createPin(pinData);
      createdPins.push(pin);
    }

    return createdPins;
  } catch (error) {
    console.error('Error bulk creating pins:', error);
    throw new Error(`Failed to bulk create pins: ${error.message}`);
  }
}

/**
 * Bulk update pins
 * @param {Array} pinIds - Array of pin IDs
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Array>} Updated pins
 */
export async function bulkUpdatePins(pinIds, updates) {
  try {
    const updatedPins = [];

    for (const pinId of pinIds) {
      const updated = await updatePin(pinId, updates);
      updatedPins.push(updated);
    }

    return updatedPins;
  } catch (error) {
    console.error('Error bulk updating pins:', error);
    throw new Error(`Failed to bulk update pins: ${error.message}`);
  }
}

/**
 * Bulk delete pins
 * @param {Array} pinIds - Array of pin IDs
 * @returns {Promise<boolean>} Success status
 */
export async function bulkDeletePins(pinIds) {
  try {
    for (const pinId of pinIds) {
      await deletePin(pinId);
    }

    return true;
  } catch (error) {
    console.error('Error bulk deleting pins:', error);
    throw new Error(`Failed to bulk delete pins: ${error.message}`);
  }
}

// ============================================================================
// Pin Analytics
// ============================================================================

/**
 * Fetch pin analytics from Pinterest
 * @param {string} pinId - Pin ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Pin analytics
 */
export async function fetchPinAnalytics(pinId, userId) {
  try {
    const pin = await getPin(pinId);

    if (!pin.pinId) {
      return {
        impressions: 0,
        saves: 0,
        clicks: 0,
        closeups: 0
      };
    }

    const accessToken = await getValidAccessToken(userId);

    const response = await fetch(`${PINTEREST_API_BASE}/pins/${pin.pinId}/analytics`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pin analytics');
    }

    const analyticsData = await response.json();

    // Update local pin with analytics
    pin.impressions = analyticsData.all_time?.IMPRESSION || 0;
    pin.saves = analyticsData.all_time?.SAVE || 0;
    pin.clicks = analyticsData.all_time?.OUTBOUND_CLICK || 0;
    pin.closeups = analyticsData.all_time?.PIN_CLICK || 0;
    pin.updatedAt = new Date();

    await wixData.update(COLLECTIONS.PINTEREST_PINS, pin);

    return {
      impressions: pin.impressions,
      saves: pin.saves,
      clicks: pin.clicks,
      closeups: pin.closeups
    };
  } catch (error) {
    console.error('Error fetching pin analytics:', error);
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }
}

/**
 * Sync analytics for all published pins
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of pins updated
 */
export async function syncAllPinAnalytics(pinterestAccountId, userId) {
  try {
    const pins = await getPins(pinterestAccountId, { status: 'published' });

    let updateCount = 0;

    for (const pin of pins) {
      try {
        await fetchPinAnalytics(pin._id, userId);
        updateCount++;
      } catch (error) {
        console.error(`Error syncing analytics for pin ${pin._id}:`, error);
        // Continue with other pins
      }
    }

    return updateCount;
  } catch (error) {
    console.error('Error syncing all pin analytics:', error);
    throw error;
  }
}

// ============================================================================
// Pin Statistics
// ============================================================================

/**
 * Get pin statistics for an account
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {Object} options - Options
 * @returns {Promise<Object>} Statistics
 */
export async function getPinStatistics(pinterestAccountId, options = {}) {
  try {
    const allPins = await getPins(pinterestAccountId, options);

    const stats = {
      total: allPins.length,
      byStatus: {
        draft: 0,
        scheduled: 0,
        published: 0,
        failed: 0
      },
      totalImpressions: 0,
      totalSaves: 0,
      totalClicks: 0,
      avgEngagementRate: 0
    };

    allPins.forEach(pin => {
      stats.byStatus[pin.status] = (stats.byStatus[pin.status] || 0) + 1;
      stats.totalImpressions += pin.impressions || 0;
      stats.totalSaves += pin.saves || 0;
      stats.totalClicks += pin.clicks || 0;
    });

    // Calculate engagement rate
    if (stats.totalImpressions > 0) {
      const totalEngagements = stats.totalSaves + stats.totalClicks;
      stats.avgEngagementRate = (totalEngagements / stats.totalImpressions) * 100;
    }

    return stats;
  } catch (error) {
    console.error('Error getting pin statistics:', error);
    throw error;
  }
}

export default {
  createPin,
  getPin,
  getPins,
  updatePin,
  deletePin,
  publishPin,
  schedulePin,
  processScheduledPins,
  bulkCreatePins,
  bulkUpdatePins,
  bulkDeletePins,
  fetchPinAnalytics,
  syncAllPinAnalytics,
  getPinStatistics
};
