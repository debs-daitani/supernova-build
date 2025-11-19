/**
 * Membership Service
 * Handles feature access, usage limits, and tier management
 */

/**
 * Check if user has access to a specific feature
 * @param {string} userId - User ID
 * @param {string} featureKey - Feature key to check
 * @param {object} prisma - Prisma client instance
 * @returns {Promise<boolean>} - True if user has access
 */
async function hasFeatureAccess(userId, featureKey, prisma) {
  if (!prisma) {
    console.warn('Prisma client not provided to hasFeatureAccess');
    return false;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        membershipTier: true,
        addOnPurchases: {
          where: { status: 'ACTIVE' },
          include: { addOn: true }
        }
      }
    });

    if (!user || !user.membershipTier) {
      return false;
    }

    // Check tier features
    const feature = await prisma.feature.findUnique({
      where: { key: featureKey }
    });

    if (!feature || !feature.isActive) {
      return false;
    }

    // Check if tier includes feature
    const tierHasFeature = feature.availableInTiers.includes(user.membershipTier.slug);

    // Check if user has add-on that unlocks feature
    const addonHasFeature = user.addOnPurchases.some(
      purchase => purchase.addOn.feature === featureKey
    );

    return tierHasFeature || addonHasFeature;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Check if user is within usage limits for a specific metric
 * @param {string} userId - User ID
 * @param {string} metric - Usage metric to check
 * @param {object} prisma - Prisma client instance
 * @returns {Promise<object>} - Usage limit info
 */
async function checkUsageLimit(userId, metric, prisma) {
  if (!prisma) {
    console.warn('Prisma client not provided to checkUsageLimit');
    return { allowed: false, current: 0, limit: 0 };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { membershipTier: true }
    });

    if (!user || !user.membershipTier) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const limits = user.membershipTier.limits;
    const limit = limits[metric];

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1, unlimited: true };
    }

    // If limit is 0, user has no access to this feature
    if (limit === 0) {
      return { allowed: false, current: 0, limit: 0, blocked: true };
    }

    // Get current period (monthly)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get or create usage record
    let usage = await prisma.usageRecord.findUnique({
      where: {
        userId_metric_periodStart: {
          userId,
          metric,
          periodStart
        }
      }
    });

    if (!usage) {
      usage = await prisma.usageRecord.create({
        data: {
          userId,
          metric,
          value: 0,
          periodStart,
          periodEnd
        }
      });
    }

    // Check add-ons for extra limits
    const addOns = await prisma.addOnPurchase.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: { addOn: true }
    });

    let extraLimit = 0;
    addOns.forEach(purchase => {
      if (purchase.addOn.extraLimit && purchase.addOn.extraLimit[metric]) {
        extraLimit += purchase.addOn.extraLimit[metric];
      }
    });

    const totalLimit = limit + extraLimit;
    const allowed = usage.value < totalLimit;

    return {
      allowed,
      current: usage.value,
      limit: totalLimit,
      baseLimit: limit,
      extraLimit,
      remaining: Math.max(0, totalLimit - usage.value),
      percentUsed: totalLimit > 0 ? Math.round((usage.value / totalLimit) * 100) : 0
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return { allowed: false, current: 0, limit: 0, error: error.message };
  }
}

/**
 * Increment usage for a specific metric
 * @param {string} userId - User ID
 * @param {string} metric - Usage metric to increment
 * @param {number} amount - Amount to increment (default 1)
 * @param {object} prisma - Prisma client instance
 */
async function incrementUsage(userId, metric, amount = 1, prisma) {
  if (!prisma) {
    console.warn('Prisma client not provided to incrementUsage');
    return;
  }

  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await prisma.usageRecord.upsert({
      where: {
        userId_metric_periodStart: {
          userId,
          metric,
          periodStart
        }
      },
      update: {
        value: { increment: amount }
      },
      create: {
        userId,
        metric,
        value: amount,
        periodStart,
        periodEnd
      }
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
}

/**
 * Decrement usage for a specific metric (e.g., when deleting something)
 * @param {string} userId - User ID
 * @param {string} metric - Usage metric to decrement
 * @param {number} amount - Amount to decrement (default 1)
 * @param {object} prisma - Prisma client instance
 */
async function decrementUsage(userId, metric, amount = 1, prisma) {
  if (!prisma) {
    console.warn('Prisma client not provided to decrementUsage');
    return;
  }

  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await prisma.usageRecord.upsert({
      where: {
        userId_metric_periodStart: {
          userId,
          metric,
          periodStart
        }
      },
      update: {
        value: { decrement: amount }
      },
      create: {
        userId,
        metric,
        value: 0,
        periodStart,
        periodEnd
      }
    });
  } catch (error) {
    console.error('Error decrementing usage:', error);
  }
}

/**
 * Get user's current limits and usage summary
 * @param {string} userId - User ID
 * @param {object} prisma - Prisma client instance
 * @returns {Promise<object>} - Usage summary
 */
async function getUserUsageSummary(userId, prisma) {
  if (!prisma) {
    console.warn('Prisma client not provided to getUserUsageSummary');
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        membershipTier: true,
        addOnPurchases: {
          where: { status: 'ACTIVE' },
          include: { addOn: true }
        }
      }
    });

    if (!user || !user.membershipTier) {
      return null;
    }

    const limits = user.membershipTier.limits;
    const metrics = Object.keys(limits);

    const summary = {};

    for (const metric of metrics) {
      const usage = await checkUsageLimit(userId, metric, prisma);
      summary[metric] = usage;
    }

    return {
      tier: user.membershipTier,
      limits: summary,
      addOns: user.addOnPurchases.map(p => ({
        id: p.id,
        name: p.addOn.name,
        feature: p.addOn.feature,
        extraLimit: p.addOn.extraLimit,
        purchasedAt: p.purchasedAt
      }))
    };
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return null;
  }
}

/**
 * Change user's membership tier
 * @param {string} userId - User ID
 * @param {string} newTierSlug - New tier slug
 * @param {object} prisma - Prisma client instance
 * @returns {Promise<object>} - New tier
 */
async function changeMembershipTier(userId, newTierSlug, prisma) {
  if (!prisma) {
    throw new Error('Prisma client not provided');
  }

  const newTier = await prisma.membershipTier.findUnique({
    where: { slug: newTierSlug }
  });

  if (!newTier) {
    throw new Error('Tier not found');
  }

  if (!newTier.isActive) {
    throw new Error('Tier is not active');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { membershipTierId: newTier.id }
  });

  return newTier;
}

/**
 * Get recommended tier for upgrade
 * @param {string} userId - User ID
 * @param {string} feature - Feature user is trying to access
 * @param {object} prisma - Prisma client instance
 * @returns {Promise<object>} - Recommended tier
 */
async function getRecommendedUpgradeTier(userId, feature, prisma) {
  if (!prisma) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { membershipTier: true }
    });

    if (!user) return null;

    // Find feature
    const featureObj = await prisma.feature.findUnique({
      where: { key: feature }
    });

    if (!featureObj) return null;

    // Find cheapest tier that includes this feature
    const tiersWithFeature = await prisma.membershipTier.findMany({
      where: {
        slug: { in: featureObj.availableInTiers },
        isActive: true,
        isPublic: true
      },
      orderBy: { priceMonthly: 'asc' }
    });

    // Return first tier (cheapest) that's higher than current
    const currentPrice = user.membershipTier?.priceMonthly || 0;
    return tiersWithFeature.find(t => t.priceMonthly > currentPrice) || tiersWithFeature[0];
  } catch (error) {
    console.error('Error getting recommended tier:', error);
    return null;
  }
}

/**
 * Reset usage for new billing period
 * @param {string} userId - User ID
 * @param {object} prisma - Prisma client instance
 */
async function resetUsageForNewPeriod(userId, prisma) {
  if (!prisma) {
    return;
  }

  try {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Archive old usage records
    await prisma.usageRecord.updateMany({
      where: {
        userId,
        periodEnd: { lt: now }
      },
      data: {
        // Keep for historical purposes, but mark as old
      }
    });
  } catch (error) {
    console.error('Error resetting usage:', error);
  }
}

module.exports = {
  hasFeatureAccess,
  checkUsageLimit,
  incrementUsage,
  decrementUsage,
  getUserUsageSummary,
  changeMembershipTier,
  getRecommendedUpgradeTier,
  resetUsageForNewPeriod
};
