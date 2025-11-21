const { getPrisma } = require('../utils/database');
const {
  parseFeatures,
  hasFeatureAccess,
  getFeatureLimit,
  isWithinLimit,
  getRemainingUsage,
} = require('../utils/tierComparison');

/**
 * Subscription Service
 * Handles all subscription-related operations
 */

/**
 * Get all subscription tiers
 * @returns {Promise<Array>} List of all tiers
 */
const getAllTiers = async () => {
  const prisma = getPrisma();
  const tiers = await prisma.subscriptionTier.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // Parse features JSON for each tier
  return tiers.map((tier) => ({
    ...tier,
    features: parseFeatures(tier.features),
  }));
};

/**
 * Get tier by name
 * @param {string} tierName - Name of the tier (BRAVE, BOLD, BADASS)
 * @returns {Promise<object|null>} Tier object or null
 */
const getTierByName = async (tierName) => {
  const prisma = getPrisma();
  const tier = await prisma.subscriptionTier.findUnique({
    where: { name: tierName.toUpperCase() },
  });

  if (!tier) {
    return null;
  }

  return {
    ...tier,
    features: parseFeatures(tier.features),
  };
};

/**
 * Get tier by ID
 * @param {string} tierId - Tier ID
 * @returns {Promise<object|null>} Tier object or null
 */
const getTierById = async (tierId) => {
  const prisma = getPrisma();
  const tier = await prisma.subscriptionTier.findUnique({
    where: { id: tierId },
  });

  if (!tier) {
    return null;
  }

  return {
    ...tier,
    features: parseFeatures(tier.features),
  };
};

/**
 * Get user's subscription
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} User subscription with tier details
 */
const getUserSubscription = async (userId) => {
  const prisma = getPrisma();
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: {
      tier: true,
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    ...subscription,
    tier: {
      ...subscription.tier,
      features: parseFeatures(subscription.tier.features),
    },
  };
};

/**
 * Create subscription for user
 * @param {string} userId - User ID
 * @param {string} tierName - Tier name (BRAVE, BOLD, BADASS)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Created subscription
 */
const createSubscription = async (userId, tierName, options = {}) => {
  const prisma = getPrisma();

  // Get tier
  const tier = await getTierByName(tierName);
  if (!tier) {
    throw new Error(`Tier not found: ${tierName}`);
  }

  // Check if user already has subscription
  const existing = await getUserSubscription(userId);
  if (existing) {
    throw new Error('User already has a subscription');
  }

  // Calculate period dates (1 month from now)
  const now = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Create subscription
  const subscription = await prisma.userSubscription.create({
    data: {
      userId,
      tierId: tier.id,
      status: options.status || 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      stripeCustomerId: options.stripeCustomerId,
      stripeSubscriptionId: options.stripeSubscriptionId,
    },
    include: {
      tier: true,
    },
  });

  // Create usage tracking for user
  await prisma.usageTracking.create({
    data: {
      userId,
      periodStart: now,
      periodEnd: periodEnd,
    },
  });

  return {
    ...subscription,
    tier: {
      ...subscription.tier,
      features: parseFeatures(subscription.tier.features),
    },
  };
};

/**
 * Update user subscription (upgrade/downgrade)
 * @param {string} userId - User ID
 * @param {string} newTierName - New tier name
 * @returns {Promise<object>} Updated subscription
 */
const updateSubscription = async (userId, newTierName) => {
  const prisma = getPrisma();

  // Get new tier
  const newTier = await getTierByName(newTierName);
  if (!newTier) {
    throw new Error(`Tier not found: ${newTierName}`);
  }

  // Get current subscription
  const current = await getUserSubscription(userId);
  if (!current) {
    throw new Error('User does not have a subscription');
  }

  // Update subscription
  const subscription = await prisma.userSubscription.update({
    where: { userId },
    data: {
      tierId: newTier.id,
      status: 'ACTIVE',
      cancelAt: null,
      canceledAt: null,
    },
    include: {
      tier: true,
    },
  });

  return {
    ...subscription,
    tier: {
      ...subscription.tier,
      features: parseFeatures(subscription.tier.features),
    },
  };
};

/**
 * Cancel subscription (at period end)
 * @param {string} userId - User ID
 * @returns {Promise<object>} Updated subscription
 */
const cancelSubscription = async (userId) => {
  const prisma = getPrisma();

  // Get current subscription
  const current = await getUserSubscription(userId);
  if (!current) {
    throw new Error('User does not have a subscription');
  }

  // Set to cancel at period end
  const subscription = await prisma.userSubscription.update({
    where: { userId },
    data: {
      status: 'CANCELED',
      cancelAt: current.currentPeriodEnd,
      canceledAt: new Date(),
    },
    include: {
      tier: true,
    },
  });

  return {
    ...subscription,
    tier: {
      ...subscription.tier,
      features: parseFeatures(subscription.tier.features),
    },
  };
};

/**
 * Check if user has access to a feature
 * @param {string} userId - User ID
 * @param {string} featureName - Feature name
 * @returns {Promise<boolean>} True if user has access
 */
const checkFeatureAccess = async (userId, featureName) => {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return false;
  }

  if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
    return false;
  }

  return hasFeatureAccess(subscription.tier.features, featureName);
};

/**
 * Get user's remaining usage for a feature
 * @param {string} userId - User ID
 * @param {string} featureName - Feature name
 * @returns {Promise<object>} Usage details
 */
const getRemainingFeatureUsage = async (userId, featureName) => {
  const prisma = getPrisma();

  // Get subscription
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  // Get usage tracking
  const usage = await prisma.usageTracking.findUnique({
    where: { userId },
  });

  if (!usage) {
    throw new Error('Usage tracking not found');
  }

  // Map feature names to usage fields
  const usageFieldMap = {
    snMessages: 'snMessagesUsed',
    socialPosts: 'socialPostsUsed',
    contentRepurposer: 'contentRepurposeUsed',
    aiImages: 'aiImagesUsed',
    aiVideos: 'aiVideosUsed',
    mockupsPerWeek: 'mockupsUsed',
  };

  const usageField = usageFieldMap[featureName];
  if (!usageField) {
    throw new Error(`Unknown feature: ${featureName}`);
  }

  const used = usage[usageField] || 0;
  const limit = getFeatureLimit(subscription.tier.features, featureName);
  const remaining = getRemainingUsage(used, limit);

  return {
    feature: featureName,
    used,
    limit,
    remaining,
    unlimited: limit === null || limit === 'unlimited' || limit === 'all',
    withinLimit: isWithinLimit(used, limit),
  };
};

/**
 * Get all usage stats for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Complete usage stats
 */
const getAllUsageStats = async (userId) => {
  const prisma = getPrisma();

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('User does not have a subscription');
  }

  const usage = await prisma.usageTracking.findUnique({
    where: { userId },
  });

  if (!usage) {
    throw new Error('Usage tracking not found');
  }

  const features = subscription.tier.features;

  return {
    tier: {
      name: subscription.tier.name,
      displayName: subscription.tier.displayName,
    },
    period: {
      start: usage.periodStart,
      end: usage.periodEnd,
    },
    usage: {
      snMessages: {
        used: usage.snMessagesUsed,
        limit: getFeatureLimit(features, 'snMessages'),
        remaining: getRemainingUsage(
          usage.snMessagesUsed,
          getFeatureLimit(features, 'snMessages')
        ),
      },
      socialPosts: {
        used: usage.socialPostsUsed,
        limit: getFeatureLimit(features, 'socialPosts'),
        remaining: getRemainingUsage(
          usage.socialPostsUsed,
          getFeatureLimit(features, 'socialPosts')
        ),
      },
      contentRepurpose: {
        used: usage.contentRepurposeUsed,
        limit: getFeatureLimit(features, 'contentRepurposer'),
        remaining: getRemainingUsage(
          usage.contentRepurposeUsed,
          getFeatureLimit(features, 'contentRepurposer')
        ),
      },
      aiImages: {
        used: usage.aiImagesUsed,
        limit: getFeatureLimit(features, 'aiImages'),
        remaining: getRemainingUsage(
          usage.aiImagesUsed,
          getFeatureLimit(features, 'aiImages')
        ),
      },
      aiVideos: {
        used: usage.aiVideosUsed,
        limit: getFeatureLimit(features, 'aiVideos'),
        remaining: getRemainingUsage(
          usage.aiVideosUsed,
          getFeatureLimit(features, 'aiVideos')
        ),
      },
      mockups: {
        used: usage.mockupsUsed,
        limit: getFeatureLimit(features, 'mockupsPerWeek'),
        remaining: getRemainingUsage(
          usage.mockupsUsed,
          getFeatureLimit(features, 'mockupsPerWeek')
        ),
      },
    },
  };
};

/**
 * Reset monthly usage for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Updated usage tracking
 */
const resetMonthlyUsage = async (userId) => {
  const prisma = getPrisma();

  const now = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return await prisma.usageTracking.update({
    where: { userId },
    data: {
      snMessagesUsed: 0,
      socialPostsUsed: 0,
      contentRepurposeUsed: 0,
      aiImagesUsed: 0,
      aiVideosUsed: 0,
      mockupsUsed: 0,
      periodStart: now,
      periodEnd: periodEnd,
      lastResetAt: now,
    },
  });
};

module.exports = {
  getAllTiers,
  getTierByName,
  getTierById,
  getUserSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  checkFeatureAccess,
  getRemainingFeatureUsage,
  getAllUsageStats,
  resetMonthlyUsage,
};
