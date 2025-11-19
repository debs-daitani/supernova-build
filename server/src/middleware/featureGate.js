/**
 * Feature Gate Middleware
 * Protects routes by requiring specific features or usage limits
 */

const { hasFeatureAccess, checkUsageLimit } = require('../services/membershipService');

/**
 * Require specific feature access
 * Returns 403 if user doesn't have access to feature
 *
 * Usage: router.post('/products', authenticate, requireFeature('ecommerce'), createProduct)
 *
 * @param {string} featureKey - Feature key required
 * @returns {Function} Express middleware
 */
function requireFeature(featureKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get prisma from request (should be attached by app)
      const prisma = req.prisma || global.prisma;

      if (!prisma) {
        console.error('Prisma client not available in request');
        return res.status(500).json({ error: 'Database connection error' });
      }

      const hasAccess = await hasFeatureAccess(req.user.id, featureKey, prisma);

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Feature not available in your plan',
          code: 'FEATURE_LOCKED',
          feature: featureKey,
          upgradeRequired: true,
          message: `Access to ${featureKey} is not included in your current plan. Please upgrade to access this feature.`
        });
      }

      // Attach feature info to request
      req.feature = featureKey;

      next();
    } catch (error) {
      console.error('Error in requireFeature middleware:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

/**
 * Require usage limit check
 * Returns 429 if user has reached their limit
 *
 * Usage: router.post('/pages', authenticate, requireLimit('pages'), createPage)
 *
 * @param {string} metric - Usage metric to check
 * @returns {Function} Express middleware
 */
function requireLimit(metric) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const prisma = req.prisma || global.prisma;

      if (!prisma) {
        console.error('Prisma client not available in request');
        return res.status(500).json({ error: 'Database connection error' });
      }

      const limit = await checkUsageLimit(req.user.id, metric, prisma);

      // If blocked (limit is 0), this feature is not available at all
      if (limit.blocked) {
        return res.status(403).json({
          error: 'Feature not available in your plan',
          code: 'FEATURE_BLOCKED',
          metric,
          upgradeRequired: true,
          message: `This feature is not included in your current plan. Please upgrade to access it.`
        });
      }

      // If limit reached, return 429 (Too Many Requests)
      if (!limit.allowed) {
        return res.status(429).json({
          error: 'Usage limit reached',
          code: 'LIMIT_REACHED',
          metric,
          current: limit.current,
          limit: limit.limit,
          remaining: 0,
          upgradeRequired: true,
          message: `You've reached your ${metric.replace(/_/g, ' ')} limit (${limit.limit}). Upgrade your plan or purchase an add-on for more capacity.`
        });
      }

      // Attach limit info to request for use in route handler
      req.usageLimit = limit;
      req.metric = metric;

      next();
    } catch (error) {
      console.error('Error in requireLimit middleware:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

/**
 * Require specific tier or higher
 * Returns 403 if user is on a lower tier
 *
 * Usage: router.get('/analytics', authenticate, requireTier('supernova-lte'), getAnalytics)
 *
 * @param {string} requiredTierSlug - Minimum required tier slug
 * @returns {Function} Express middleware
 */
function requireTier(requiredTierSlug) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const prisma = req.prisma || global.prisma;

      if (!prisma) {
        console.error('Prisma client not available in request');
        return res.status(500).json({ error: 'Database connection error' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { membershipTier: true }
      });

      if (!user || !user.membershipTier) {
        return res.status(403).json({
          error: 'No active membership',
          code: 'NO_MEMBERSHIP',
          upgradeRequired: true
        });
      }

      // Get required tier
      const requiredTier = await prisma.membershipTier.findUnique({
        where: { slug: requiredTierSlug }
      });

      if (!requiredTier) {
        return res.status(500).json({ error: 'Invalid tier configuration' });
      }

      // Check if user's tier is sufficient (based on price)
      if (user.membershipTier.priceMonthly < requiredTier.priceMonthly) {
        return res.status(403).json({
          error: 'Insufficient membership tier',
          code: 'TIER_INSUFFICIENT',
          currentTier: user.membershipTier.slug,
          requiredTier: requiredTierSlug,
          upgradeRequired: true,
          message: `This feature requires ${requiredTier.name} or higher. You are currently on ${user.membershipTier.name}.`
        });
      }

      req.userTier = user.membershipTier;

      next();
    } catch (error) {
      console.error('Error in requireTier middleware:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

/**
 * Optional feature check - doesn't block, but adds info to request
 * Useful for showing different UI based on feature access
 *
 * Usage: router.get('/dashboard', authenticate, optionalFeature('analytics'), getDashboard)
 *
 * @param {string} featureKey - Feature key to check
 * @returns {Function} Express middleware
 */
function optionalFeature(featureKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next();
      }

      const prisma = req.prisma || global.prisma;

      if (prisma) {
        const hasAccess = await hasFeatureAccess(req.user.id, featureKey, prisma);
        req.hasFeature = req.hasFeature || {};
        req.hasFeature[featureKey] = hasAccess;
      }

      next();
    } catch (error) {
      console.error('Error in optionalFeature middleware:', error);
      next(); // Don't block on error
    }
  };
}

module.exports = {
  requireFeature,
  requireLimit,
  requireTier,
  optionalFeature
};
