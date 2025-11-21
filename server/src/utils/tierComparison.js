/**
 * Tier Comparison Utility
 * Helper functions for comparing subscription tiers and checking feature access
 */

/**
 * Tier Levels for Comparison
 */
const TIER_LEVELS = {
  BRAVE: 1,
  BOLD: 2,
  BADASS: 3,
};

/**
 * Tier Names
 */
const TIER_NAMES = {
  BRAVE: 'BRAVE',
  BOLD: 'BOLD',
  BADASS: 'BADASS',
};

/**
 * Get numeric level for a tier
 * @param {string} tierName - Name of the tier (BRAVE, BOLD, BADASS)
 * @returns {number} Tier level (1-3)
 */
const getTierLevel = (tierName) => {
  const level = TIER_LEVELS[tierName?.toUpperCase()];
  if (!level) {
    throw new Error(`Invalid tier name: ${tierName}`);
  }
  return level;
};

/**
 * Compare two tiers
 * @param {string} tierA - First tier name
 * @param {string} tierB - Second tier name
 * @returns {number} -1 if A < B, 0 if A == B, 1 if A > B
 */
const compareTiers = (tierA, tierB) => {
  const levelA = getTierLevel(tierA);
  const levelB = getTierLevel(tierB);

  if (levelA < levelB) return -1;
  if (levelA > levelB) return 1;
  return 0;
};

/**
 * Check if tier A is greater than or equal to tier B
 * @param {string} tierA - First tier name
 * @param {string} tierB - Second tier name
 * @returns {boolean} True if A >= B
 */
const isTierGreaterOrEqual = (tierA, tierB) => {
  return compareTiers(tierA, tierB) >= 0;
};

/**
 * Check if tier A is greater than tier B
 * @param {string} tierA - First tier name
 * @param {string} tierB - Second tier name
 * @returns {boolean} True if A > B
 */
const isTierGreater = (tierA, tierB) => {
  return compareTiers(tierA, tierB) > 0;
};

/**
 * Get feature limit from tier features
 * @param {object} features - Tier features object
 * @param {string} featureName - Name of the feature
 * @returns {number|string|null} Feature limit or null if unlimited
 */
const getFeatureLimit = (features, featureName) => {
  if (!features || typeof features !== 'object') {
    return null;
  }

  const limit = features[featureName];

  // Handle "unlimited" string
  if (limit === 'unlimited' || limit === 'all') {
    return null; // null means unlimited
  }

  // Convert to number if possible
  if (typeof limit === 'string') {
    const parsed = parseInt(limit, 10);
    return isNaN(parsed) ? limit : parsed;
  }

  return limit;
};

/**
 * Check if feature is unlimited for the tier
 * @param {object} features - Tier features object
 * @param {string} featureName - Name of the feature
 * @returns {boolean} True if unlimited
 */
const isFeatureUnlimited = (features, featureName) => {
  const limit = getFeatureLimit(features, featureName);
  return limit === null || limit === 'unlimited' || limit === 'all';
};

/**
 * Check if tier has access to a feature
 * @param {object} features - Tier features object
 * @param {string} featureName - Name of the feature
 * @returns {boolean} True if feature is available
 */
const hasFeatureAccess = (features, featureName) => {
  if (!features || typeof features !== 'object') {
    return false;
  }

  // Check if feature exists in tier
  const featureValue = features[featureName];

  // Feature doesn't exist = no access
  if (featureValue === undefined || featureValue === null) {
    return false;
  }

  // Feature exists with any value = has access
  return true;
};

/**
 * Check if usage is within limit
 * @param {number} used - Current usage
 * @param {number|string|null} limit - Limit (number, 'unlimited', or null)
 * @returns {boolean} True if within limit
 */
const isWithinLimit = (used, limit) => {
  // Unlimited or no limit
  if (limit === null || limit === 'unlimited' || limit === 'all') {
    return true;
  }

  // Convert limit to number
  const numericLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  // Invalid limit = assume unlimited
  if (isNaN(numericLimit)) {
    return true;
  }

  // Check if under limit
  return used < numericLimit;
};

/**
 * Get remaining usage
 * @param {number} used - Current usage
 * @param {number|string|null} limit - Limit
 * @returns {number|null} Remaining usage or null if unlimited
 */
const getRemainingUsage = (used, limit) => {
  // Unlimited or no limit
  if (limit === null || limit === 'unlimited' || limit === 'all') {
    return null; // null means unlimited
  }

  // Convert limit to number
  const numericLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  // Invalid limit = assume unlimited
  if (isNaN(numericLimit)) {
    return null;
  }

  // Calculate remaining
  const remaining = numericLimit - used;
  return Math.max(0, remaining);
};

/**
 * Parse features JSON string
 * @param {string} featuresJson - JSON string of features
 * @returns {object} Parsed features object
 */
const parseFeatures = (featuresJson) => {
  if (!featuresJson) {
    return {};
  }

  if (typeof featuresJson === 'object') {
    return featuresJson;
  }

  try {
    return JSON.parse(featuresJson);
  } catch (error) {
    console.error('Failed to parse features JSON:', error);
    return {};
  }
};

/**
 * Format limit for display
 * @param {number|string|null} limit - Limit value
 * @returns {string} Formatted limit
 */
const formatLimit = (limit) => {
  if (limit === null || limit === 'unlimited' || limit === 'all') {
    return 'Unlimited';
  }

  if (typeof limit === 'number') {
    return limit.toLocaleString();
  }

  return String(limit);
};

module.exports = {
  TIER_LEVELS,
  TIER_NAMES,
  getTierLevel,
  compareTiers,
  isTierGreaterOrEqual,
  isTierGreater,
  getFeatureLimit,
  isFeatureUnlimited,
  hasFeatureAccess,
  isWithinLimit,
  getRemainingUsage,
  parseFeatures,
  formatLimit,
};
