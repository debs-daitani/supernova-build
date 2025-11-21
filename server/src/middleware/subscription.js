const {
  getUserSubscription,
  checkFeatureAccess,
} = require('../services/subscriptionService');
const { checkLimit, trackFeatureUsage } = require('../services/usageService');
const { AppError } = require('./errorHandler');

/**
 * Subscription Middleware
 * Handles feature access control and usage tracking
 */

/**
 * Require active subscription
 * Middleware to ensure user has an active subscription
 */
const requireSubscription = async (req, res, next) => {
  try {
    // TODO: Get userId from authenticated user (req.user.id)
    // For now, expect it in request body or query
    const userId = req.user?.id || req.body?.userId || req.query?.userId;

    if (!userId) {
      throw new AppError('User ID required', 401);
    }

    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      throw new AppError('No active subscription found', 403);
    }

    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
      throw new AppError('Subscription is not active', 403);
    }

    // Attach subscription to request
    req.subscription = subscription;
    req.userId = userId;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require specific feature access
 * @param {string} featureName - Name of the feature to check
 * @returns {Function} Middleware function
 */
const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId || req.user?.id || req.body?.userId || req.query?.userId;

      if (!userId) {
        throw new AppError('User ID required', 401);
      }

      const hasAccess = await checkFeatureAccess(userId, featureName);

      if (!hasAccess) {
        throw new AppError(
          `Access denied. Feature "${featureName}" not available in your plan`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check usage limit for a feature
 * @param {string} featureName - Name of the feature to check
 * @returns {Function} Middleware function
 */
const checkUsageLimit = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId || req.user?.id || req.body?.userId || req.query?.userId;

      if (!userId) {
        throw new AppError('User ID required', 401);
      }

      const withinLimit = await checkLimit(userId, featureName);

      if (!withinLimit) {
        throw new AppError(
          `Usage limit reached for "${featureName}". Please upgrade your plan`,
          429
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Track feature usage automatically
 * @param {string} featureName - Name of the feature to track
 * @param {number} count - Usage count (default 1)
 * @returns {Function} Middleware function
 */
const trackFeatureUse = (featureName, count = 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId || req.user?.id || req.body?.userId || req.query?.userId;

      if (!userId) {
        throw new AppError('User ID required', 401);
      }

      // Track usage after successful request
      // We'll attach a function to be called in the route handler
      req.trackUsage = async () => {
        try {
          await trackFeatureUsage(userId, featureName, count);
        } catch (error) {
          console.error('Failed to track usage:', error);
          // Don't throw error here to avoid breaking the request
        }
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require feature and check limit (combined middleware)
 * @param {string} featureName - Name of the feature
 * @returns {Array} Array of middleware functions
 */
const requireFeatureWithLimit = (featureName) => {
  return [requireFeature(featureName), checkUsageLimit(featureName)];
};

/**
 * Complete feature middleware (check access, limit, and track)
 * @param {string} featureName - Name of the feature
 * @param {number} count - Usage count (default 1)
 * @returns {Array} Array of middleware functions
 */
const featureMiddleware = (featureName, count = 1) => {
  return [
    requireSubscription,
    requireFeature(featureName),
    checkUsageLimit(featureName),
    trackFeatureUse(featureName, count),
  ];
};

module.exports = {
  requireSubscription,
  requireFeature,
  checkUsageLimit,
  trackFeatureUse,
  requireFeatureWithLimit,
  featureMiddleware,
};
