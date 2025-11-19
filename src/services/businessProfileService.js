/**
 * SUPERNova AI Business Advisor - Profile Service
 *
 * Manages business profiles:
 * - Profile CRUD operations
 * - Setup wizard
 * - SWOT analysis
 * - Business data integration
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  BUSINESS_PROFILES: 'BusinessProfiles'
};

// ============================================================================
// Profile Management
// ============================================================================

/**
 * Get business profile for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Business profile or null if not found
 */
export async function getProfile(userId) {
  try {
    const results = await wixData.query(COLLECTIONS.BUSINESS_PROFILES)
      .eq('userId', userId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting business profile:', error);
    throw new Error(`Failed to get profile: ${error.message}`);
  }
}

/**
 * Create a new business profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} Created profile
 */
export async function createProfile(userId, profileData) {
  try {
    // Check if profile already exists
    const existing = await getProfile(userId);
    if (existing) {
      throw new Error('Profile already exists for this user');
    }

    const now = new Date();

    const profile = {
      userId,
      businessName: profileData.businessName || '',
      industry: profileData.industry || '',
      businessModel: profileData.businessModel || '',
      monthlyRevenue: profileData.monthlyRevenue || 0,
      targetRevenue: profileData.targetRevenue || 0,
      employeeCount: profileData.employeeCount || 0,
      yearsInBusiness: profileData.yearsInBusiness || 0,
      targetAudience: profileData.targetAudience || '',
      mainProducts: profileData.mainProducts || [],
      competitors: profileData.competitors || [],
      strengths: profileData.strengths || [],
      weaknesses: profileData.weaknesses || [],
      opportunities: profileData.opportunities || [],
      threats: profileData.threats || [],
      goals: profileData.goals || [],
      challenges: profileData.challenges || [],
      timezone: profileData.timezone || 'Europe/London',
      currency: profileData.currency || 'GBP',
      setupComplete: profileData.setupComplete || false,
      lastAnalyzedAt: null,
      createdAt: now,
      updatedAt: now
    };

    const created = await wixData.insert(COLLECTIONS.BUSINESS_PROFILES, profile);
    return created;
  } catch (error) {
    console.error('Error creating business profile:', error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }
}

/**
 * Update business profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated profile
 */
export async function updateProfile(userId, updates) {
  try {
    const profile = await getProfile(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.BUSINESS_PROFILES, updatedProfile);
    return result;
  } catch (error) {
    console.error('Error updating business profile:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

/**
 * Mark setup as complete
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated profile
 */
export async function completeSetup(userId) {
  try {
    return await updateProfile(userId, {
      setupComplete: true
    });
  } catch (error) {
    console.error('Error completing setup:', error);
    throw error;
  }
}

// ============================================================================
// Setup Wizard
// ============================================================================

/**
 * Save setup wizard step
 * @param {string} userId - User ID
 * @param {number} step - Step number
 * @param {Object} data - Step data
 * @returns {Promise<Object>} Updated profile
 */
export async function saveSetupStep(userId, step, data) {
  try {
    let profile = await getProfile(userId);

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await createProfile(userId, {});
    }

    const updates = {};

    switch (step) {
      case 1: // Basic Info
        updates.businessName = data.businessName;
        updates.industry = data.industry;
        updates.businessModel = data.businessModel;
        updates.yearsInBusiness = data.yearsInBusiness;
        break;

      case 2: // Current State
        updates.monthlyRevenue = data.monthlyRevenue;
        updates.employeeCount = data.employeeCount;
        updates.mainProducts = data.mainProducts;
        break;

      case 3: // Goals
        updates.targetRevenue = data.targetRevenue;
        updates.goals = data.goals;
        updates.challenges = data.challenges;
        updates.targetAudience = data.targetAudience;
        break;

      case 4: // SWOT Analysis
        updates.strengths = data.strengths;
        updates.weaknesses = data.weaknesses;
        updates.opportunities = data.opportunities;
        updates.threats = data.threats;
        break;

      case 5: // Complete
        updates.setupComplete = true;
        break;

      default:
        throw new Error('Invalid setup step');
    }

    return await updateProfile(userId, updates);
  } catch (error) {
    console.error('Error saving setup step:', error);
    throw new Error(`Failed to save setup step: ${error.message}`);
  }
}

// ============================================================================
// SWOT Analysis
// ============================================================================

/**
 * Update SWOT analysis
 * @param {string} userId - User ID
 * @param {Object} swot - SWOT data
 * @returns {Promise<Object>} Updated profile
 */
export async function updateSWOT(userId, swot) {
  try {
    return await updateProfile(userId, {
      strengths: swot.strengths || [],
      weaknesses: swot.weaknesses || [],
      opportunities: swot.opportunities || [],
      threats: swot.threats || []
    });
  } catch (error) {
    console.error('Error updating SWOT:', error);
    throw error;
  }
}

/**
 * Get SWOT analysis
 * @param {string} userId - User ID
 * @returns {Promise<Object>} SWOT analysis
 */
export async function getSWOT(userId) {
  try {
    const profile = await getProfile(userId);

    if (!profile) {
      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };
    }

    return {
      strengths: profile.strengths || [],
      weaknesses: profile.weaknesses || [],
      opportunities: profile.opportunities || [],
      threats: profile.threats || []
    };
  } catch (error) {
    console.error('Error getting SWOT:', error);
    throw error;
  }
}

// ============================================================================
// Business Data Integration
// ============================================================================

/**
 * Get business data summary (pulls from across platform)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Business data summary
 */
export async function getBusinessDataSummary(userId) {
  try {
    const profile = await getProfile(userId);

    if (!profile) {
      return null;
    }

    // This would pull data from across the platform
    // For now, returning structure to be filled by other services

    const summary = {
      profile: {
        businessName: profile.businessName,
        industry: profile.industry,
        monthlyRevenue: profile.monthlyRevenue,
        targetRevenue: profile.targetRevenue,
        employeeCount: profile.employeeCount,
        yearsInBusiness: profile.yearsInBusiness
      },
      revenue: {
        current: profile.monthlyRevenue,
        target: profile.targetRevenue,
        growth: 0, // Calculate from historical data
        trend: 'stable'
      },
      customers: {
        total: 0, // Pull from CRM
        active: 0,
        churnRate: 0,
        ltv: 0,
        acquisitionCost: 0
      },
      marketing: {
        websiteVisitors: 0, // Pull from analytics
        emailSubscribers: 0, // Pull from email service
        conversionRate: 0,
        adSpend: 0,
        roas: 0
      },
      products: profile.mainProducts || [],
      goals: profile.goals || [],
      strengths: profile.strengths || [],
      weaknesses: profile.weaknesses || [],
      opportunities: profile.opportunities || [],
      threats: profile.threats || []
    };

    return summary;
  } catch (error) {
    console.error('Error getting business data summary:', error);
    throw error;
  }
}

/**
 * Update last analyzed timestamp
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated profile
 */
export async function updateLastAnalyzed(userId) {
  try {
    return await updateProfile(userId, {
      lastAnalyzedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating last analyzed:', error);
    throw error;
  }
}

// ============================================================================
// Competitor Management
// ============================================================================

/**
 * Add competitor
 * @param {string} userId - User ID
 * @param {Object} competitor - Competitor data
 * @returns {Promise<Object>} Updated profile
 */
export async function addCompetitor(userId, competitor) {
  try {
    const profile = await getProfile(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const competitors = profile.competitors || [];

    competitors.push({
      name: competitor.name,
      url: competitor.url || '',
      description: competitor.description || '',
      strengths: competitor.strengths || [],
      weaknesses: competitor.weaknesses || [],
      addedAt: new Date()
    });

    return await updateProfile(userId, { competitors });
  } catch (error) {
    console.error('Error adding competitor:', error);
    throw error;
  }
}

/**
 * Remove competitor
 * @param {string} userId - User ID
 * @param {string} competitorName - Competitor name
 * @returns {Promise<Object>} Updated profile
 */
export async function removeCompetitor(userId, competitorName) {
  try {
    const profile = await getProfile(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const competitors = (profile.competitors || []).filter(
      c => c.name !== competitorName
    );

    return await updateProfile(userId, { competitors });
  } catch (error) {
    console.error('Error removing competitor:', error);
    throw error;
  }
}

/**
 * Get competitors
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of competitors
 */
export async function getCompetitors(userId) {
  try {
    const profile = await getProfile(userId);
    return profile ? (profile.competitors || []) : [];
  } catch (error) {
    console.error('Error getting competitors:', error);
    throw error;
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate profile completeness
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Validation results
 */
export async function validateProfile(userId) {
  try {
    const profile = await getProfile(userId);

    if (!profile) {
      return {
        isComplete: false,
        missingFields: ['all'],
        completeness: 0
      };
    }

    const requiredFields = [
      'businessName',
      'industry',
      'businessModel',
      'monthlyRevenue',
      'targetRevenue'
    ];

    const missingFields = requiredFields.filter(field => !profile[field]);
    const completeness = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completeness: Math.round(completeness)
    };
  } catch (error) {
    console.error('Error validating profile:', error);
    throw error;
  }
}

export default {
  getProfile,
  createProfile,
  updateProfile,
  completeSetup,
  saveSetupStep,
  updateSWOT,
  getSWOT,
  getBusinessDataSummary,
  updateLastAnalyzed,
  addCompetitor,
  removeCompetitor,
  getCompetitors,
  validateProfile
};
