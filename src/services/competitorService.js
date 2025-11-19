/**
 * SUPERNova Competitor Tracker - Competitor Service
 *
 * Core competitor management:
 * - CRUD operations for competitors
 * - Listing and filtering
 * - Status management
 * - Monitoring control
 */

import wixData from 'wix-data';

const COLLECTIONS = {
  COMPETITORS: 'Competitors'
};

const COMPANY_SIZES = {
  STARTUP: 'startup',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  ENTERPRISE: 'enterprise'
};

const STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ACQUIRED: 'acquired',
  DEFUNCT: 'defunct'
};

const RELATIONSHIPS = {
  DIRECT: 'direct',     // Same product/market
  INDIRECT: 'indirect', // Similar but different angle
  ADJACENT: 'adjacent'  // Related industry
};

/**
 * Create a new competitor
 * @param {string} userId - User ID
 * @param {Object} competitorData - Competitor information
 * @returns {Promise<Object>} Created competitor
 */
export async function createCompetitor(userId, competitorData) {
  try {
    const competitor = {
      userId,
      name: competitorData.name,
      website: competitorData.website,
      description: competitorData.description || '',
      industry: competitorData.industry || '',
      size: competitorData.size || COMPANY_SIZES.SMALL,
      founded: competitorData.founded || '',
      location: competitorData.location || '',
      status: competitorData.status || STATUSES.ACTIVE,
      relationship: competitorData.relationship || RELATIONSHIPS.DIRECT,
      logo: competitorData.logo || '',
      socialProfiles: competitorData.socialProfiles || {},
      notes: competitorData.notes || '',
      monitoringEnabled: competitorData.monitoringEnabled !== false,
      lastMonitored: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await wixData.insert(COLLECTIONS.COMPETITORS, competitor);
    return result;
  } catch (error) {
    console.error('Error creating competitor:', error);
    throw new Error(`Failed to create competitor: ${error.message}`);
  }
}

/**
 * Get competitor by ID
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Competitor
 */
export async function getCompetitor(competitorId) {
  try {
    return await wixData.get(COLLECTIONS.COMPETITORS, competitorId);
  } catch (error) {
    console.error('Error getting competitor:', error);
    throw new Error(`Failed to get competitor: ${error.message}`);
  }
}

/**
 * List competitors for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Competitors
 */
export async function listCompetitors(userId, filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.COMPETITORS)
      .eq('userId', userId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.relationship) {
      query = query.eq('relationship', filters.relationship);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.monitoringEnabled !== undefined) {
      query = query.eq('monitoringEnabled', filters.monitoringEnabled);
    }

    // Sorting
    if (filters.sortBy) {
      if (filters.sortOrder === 'desc') {
        query = query.descending(filters.sortBy);
      } else {
        query = query.ascending(filters.sortBy);
      }
    } else {
      query = query.descending('createdAt');
    }

    const results = await query.find();
    return results.items;
  } catch (error) {
    console.error('Error listing competitors:', error);
    throw new Error(`Failed to list competitors: ${error.message}`);
  }
}

/**
 * Update competitor
 * @param {string} competitorId - Competitor ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated competitor
 */
export async function updateCompetitor(competitorId, updates) {
  try {
    const competitor = await getCompetitor(competitorId);

    const updated = {
      ...competitor,
      ...updates,
      updatedAt: new Date()
    };

    // Don't allow updating these fields
    delete updated._id;
    delete updated.userId;
    delete updated.createdAt;

    return await wixData.update(COLLECTIONS.COMPETITORS, updated);
  } catch (error) {
    console.error('Error updating competitor:', error);
    throw new Error(`Failed to update competitor: ${error.message}`);
  }
}

/**
 * Delete competitor
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<void>}
 */
export async function deleteCompetitor(competitorId) {
  try {
    await wixData.remove(COLLECTIONS.COMPETITORS, competitorId);
  } catch (error) {
    console.error('Error deleting competitor:', error);
    throw new Error(`Failed to delete competitor: ${error.message}`);
  }
}

/**
 * Enable monitoring for a competitor
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Updated competitor
 */
export async function enableMonitoring(competitorId) {
  try {
    return await updateCompetitor(competitorId, {
      monitoringEnabled: true
    });
  } catch (error) {
    console.error('Error enabling monitoring:', error);
    throw error;
  }
}

/**
 * Disable monitoring for a competitor
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Updated competitor
 */
export async function disableMonitoring(competitorId) {
  try {
    return await updateCompetitor(competitorId, {
      monitoringEnabled: false
    });
  } catch (error) {
    console.error('Error disabling monitoring:', error);
    throw error;
  }
}

/**
 * Update last monitored timestamp
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Updated competitor
 */
export async function updateLastMonitored(competitorId) {
  try {
    return await updateCompetitor(competitorId, {
      lastMonitored: new Date()
    });
  } catch (error) {
    console.error('Error updating last monitored:', error);
    throw error;
  }
}

/**
 * Get competitors that need monitoring
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Array>} Competitors needing monitoring
 */
export async function getCompetitorsForMonitoring(userId = null) {
  try {
    let query = wixData.query(COLLECTIONS.COMPETITORS)
      .eq('monitoringEnabled', true)
      .eq('status', STATUSES.ACTIVE);

    if (userId) {
      query = query.eq('userId', userId);
    }

    const results = await query.find();
    return results.items;
  } catch (error) {
    console.error('Error getting competitors for monitoring:', error);
    throw error;
  }
}

/**
 * Get competitor summary stats for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Summary statistics
 */
export async function getCompetitorStats(userId) {
  try {
    const competitors = await listCompetitors(userId);

    const stats = {
      total: competitors.length,
      byStatus: {},
      byRelationship: {},
      bySize: {},
      monitoring: {
        enabled: 0,
        disabled: 0
      }
    };

    competitors.forEach(comp => {
      // Count by status
      stats.byStatus[comp.status] = (stats.byStatus[comp.status] || 0) + 1;

      // Count by relationship
      stats.byRelationship[comp.relationship] =
        (stats.byRelationship[comp.relationship] || 0) + 1;

      // Count by size
      stats.bySize[comp.size] = (stats.bySize[comp.size] || 0) + 1;

      // Count monitoring
      if (comp.monitoringEnabled) {
        stats.monitoring.enabled++;
      } else {
        stats.monitoring.disabled++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting competitor stats:', error);
    throw error;
  }
}

/**
 * Search competitors by name or website
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching competitors
 */
export async function searchCompetitors(userId, searchTerm) {
  try {
    const competitors = await listCompetitors(userId);

    const lowerSearch = searchTerm.toLowerCase();

    return competitors.filter(comp => {
      return comp.name.toLowerCase().includes(lowerSearch) ||
             comp.website.toLowerCase().includes(lowerSearch) ||
             (comp.description && comp.description.toLowerCase().includes(lowerSearch));
    });
  } catch (error) {
    console.error('Error searching competitors:', error);
    throw error;
  }
}

export default {
  createCompetitor,
  getCompetitor,
  listCompetitors,
  updateCompetitor,
  deleteCompetitor,
  enableMonitoring,
  disableMonitoring,
  updateLastMonitored,
  getCompetitorsForMonitoring,
  getCompetitorStats,
  searchCompetitors,
  COMPANY_SIZES,
  STATUSES,
  RELATIONSHIPS
};
