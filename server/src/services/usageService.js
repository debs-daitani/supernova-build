const { getPrisma } = require('../utils/database');
const {
  getUserSubscription,
  getRemainingFeatureUsage,
} = require('./subscriptionService');
const { isWithinLimit, getFeatureLimit } = require('../utils/tierComparison');

/**
 * Usage Tracking Service
 * Handles feature usage tracking and limit enforcement
 */

/**
 * Get current usage tracking for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Usage tracking object
 */
const getCurrentUsage = async (userId) => {
  const prisma = getPrisma();
  const usage = await prisma.usageTracking.findUnique({
    where: { userId },
  });

  if (!usage) {
    throw new Error('Usage tracking not found for user');
  }

  return usage;
};

/**
 * Check if user is within limit for a feature
 * @param {string} userId - User ID
 * @param {string} featureName - Feature name
 * @returns {Promise<boolean>} True if within limit
 */
const checkLimit = async (userId, featureName) => {
  const usageInfo = await getRemainingFeatureUsage(userId, featureName);
  return usageInfo.withinLimit;
};

/**
 * Increment usage counter
 * @param {string} userId - User ID
 * @param {string} usageField - Usage field name
 * @param {number} amount - Amount to increment (default 1)
 * @returns {Promise<object>} Updated usage tracking
 */
const incrementUsage = async (userId, usageField, amount = 1) => {
  const prisma = getPrisma();

  return await prisma.usageTracking.update({
    where: { userId },
    data: {
      [usageField]: {
        increment: amount,
      },
    },
  });
};

/**
 * Track SUPERNova message usage
 * @param {string} userId - User ID
 * @param {number} count - Number of messages (default 1)
 * @returns {Promise<object>} Updated usage
 */
const trackSNMessage = async (userId, count = 1) => {
  // Check limit before incrementing
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await getCurrentUsage(userId);
  const limit = getFeatureLimit(subscription.tier.features, 'snMessages');

  // Check if within limit
  if (!isWithinLimit(usage.snMessagesUsed, limit)) {
    throw new Error('SUPERNova message limit reached');
  }

  // Increment usage
  return await incrementUsage(userId, 'snMessagesUsed', count);
};

/**
 * Track social post usage
 * @param {string} userId - User ID
 * @param {number} count - Number of posts (default 1)
 * @returns {Promise<object>} Updated usage
 */
const trackSocialPost = async (userId, count = 1) => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await getCurrentUsage(userId);
  const limit = getFeatureLimit(subscription.tier.features, 'socialPosts');

  if (!isWithinLimit(usage.socialPostsUsed, limit)) {
    throw new Error('Social post limit reached');
  }

  return await incrementUsage(userId, 'socialPostsUsed', count);
};

/**
 * Track content repurpose usage
 * @param {string} userId - User ID
 * @param {number} count - Number of repurposes (default 1)
 * @returns {Promise<object>} Updated usage
 */
const trackContentRepurpose = async (userId, count = 1) => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await getCurrentUsage(userId);
  const limit = getFeatureLimit(subscription.tier.features, 'contentRepurposer');

  if (!isWithinLimit(usage.contentRepurposeUsed, limit)) {
    throw new Error('Content repurpose limit reached');
  }

  return await incrementUsage(userId, 'contentRepurposeUsed', count);
};

/**
 * Track AI image generation usage
 * @param {string} userId - User ID
 * @param {number} count - Number of images (default 1)
 * @returns {Promise<object>} Updated usage
 */
const trackAIImageGen = async (userId, count = 1) => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await getCurrentUsage(userId);
  const limit = getFeatureLimit(subscription.tier.features, 'aiImages');

  if (!isWithinLimit(usage.aiImagesUsed, limit)) {
    throw new Error('AI image generation limit reached');
  }

  return await incrementUsage(userId, 'aiImagesUsed', count);
};

/**
 * Track AI video generation usage
 * @param {string} userId - User ID
 * @param {number} count - Number of videos (default 1)
 * @returns {Promise<object>} Updated usage
 */
const trackAIVideoGen = async (userId, count = 1) => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await getCurrentUsage(userId);
  const limit = getFeatureLimit(subscription.tier.features, 'aiVideos');

  if (!isWithinLimit(usage.aiVideosUsed, limit)) {
    throw new Error('AI video generation limit reached');
  }

  return await incrementUsage(userId, 'aiVideosUsed', count);
};

/**
 * Track mockup usage
 * @param {string} userId - User ID
 * @param {number} count - Number of mockups (default 1)
 * @returns {Promise<object>} Updated usage
 */
const trackMockup = async (userId, count = 1) => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await getCurrentUsage(userId);
  const limit = getFeatureLimit(subscription.tier.features, 'mockupsPerWeek');

  if (!isWithinLimit(usage.mockupsUsed, limit)) {
    throw new Error('Mockup limit reached');
  }

  return await incrementUsage(userId, 'mockupsUsed', count);
};

/**
 * Track feature usage with automatic limit checking
 * @param {string} userId - User ID
 * @param {string} featureName - Feature name
 * @param {number} count - Usage count (default 1)
 * @returns {Promise<object>} Updated usage
 */
const trackFeatureUsage = async (userId, featureName, count = 1) => {
  const featureMap = {
    snMessages: trackSNMessage,
    socialPosts: trackSocialPost,
    contentRepurposer: trackContentRepurpose,
    aiImages: trackAIImageGen,
    aiVideos: trackAIVideoGen,
    mockupsPerWeek: trackMockup,
  };

  const trackFunction = featureMap[featureName];
  if (!trackFunction) {
    throw new Error(`Unknown feature: ${featureName}`);
  }

  return await trackFunction(userId, count);
};

/**
 * Get usage summary for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Usage summary with limits
 */
const getUsageSummary = async (userId) => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await getCurrentUsage(userId);
  const features = subscription.tier.features;

  return {
    userId,
    tierName: subscription.tier.name,
    period: {
      start: usage.periodStart,
      end: usage.periodEnd,
    },
    features: {
      snMessages: {
        used: usage.snMessagesUsed,
        limit: getFeatureLimit(features, 'snMessages'),
        available: subscription.tier.features.snMessages !== undefined,
      },
      socialPosts: {
        used: usage.socialPostsUsed,
        limit: getFeatureLimit(features, 'socialPosts'),
        available: subscription.tier.features.socialPosts !== undefined,
      },
      contentRepurpose: {
        used: usage.contentRepurposeUsed,
        limit: getFeatureLimit(features, 'contentRepurposer'),
        available: subscription.tier.features.contentRepurposer !== undefined,
      },
      aiImages: {
        used: usage.aiImagesUsed,
        limit: getFeatureLimit(features, 'aiImages'),
        available: subscription.tier.features.aiImages !== undefined,
      },
      aiVideos: {
        used: usage.aiVideosUsed,
        limit: getFeatureLimit(features, 'aiVideos'),
        available: subscription.tier.features.aiVideos !== undefined,
      },
      mockups: {
        used: usage.mockupsUsed,
        limit: getFeatureLimit(features, 'mockupsPerWeek'),
        available: subscription.tier.features.mockupsPerWeek !== undefined,
      },
    },
  };
};

module.exports = {
  getCurrentUsage,
  checkLimit,
  trackSNMessage,
  trackSocialPost,
  trackContentRepurpose,
  trackAIImageGen,
  trackAIVideoGen,
  trackMockup,
  trackFeatureUsage,
  getUsageSummary,
};
