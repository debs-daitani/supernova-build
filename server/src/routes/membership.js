/**
 * Membership API Routes
 * Handles tier management, usage tracking, and add-ons
 */

const express = require('express');
const router = express.Router();
const {
  hasFeatureAccess,
  checkUsageLimit,
  incrementUsage,
  getUserUsageSummary,
  changeMembershipTier,
  getRecommendedUpgradeTier
} = require('../services/membershipService');

// Authentication middleware (implement based on your auth system)
const authenticate = (req, res, next) => {
  // TODO: Implement actual auth check
  // For now, assume user is in req.user
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Attach prisma to request
const attachPrisma = (req, res, next) => {
  req.prisma = global.prisma || req.app.get('prisma');
  if (!req.prisma) {
    return res.status(500).json({ error: 'Database connection not available' });
  }
  next();
};

/**
 * GET /api/membership/tiers
 * Get all available public tiers
 */
router.get('/tiers', attachPrisma, async (req, res) => {
  try {
    const tiers = await req.prisma.membershipTier.findMany({
      where: {
        isActive: true,
        isPublic: true
      },
      orderBy: { order: 'asc' }
    });

    res.json(tiers);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/membership/tiers/:slug
 * Get specific tier by slug
 */
router.get('/tiers/:slug', attachPrisma, async (req, res) => {
  try {
    const tier = await req.prisma.membershipTier.findUnique({
      where: { slug: req.params.slug }
    });

    if (!tier) {
      return res.status(404).json({ error: 'Tier not found' });
    }

    res.json(tier);
  } catch (error) {
    console.error('Error fetching tier:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/membership/my-tier
 * Get current user's tier and usage summary
 */
router.get('/my-tier', authenticate, attachPrisma, async (req, res) => {
  try {
    const summary = await getUserUsageSummary(req.user.id, req.prisma);

    if (!summary) {
      return res.status(404).json({ error: 'No membership found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Error fetching user tier:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/membership/check-feature/:featureKey
 * Check if user has access to a specific feature
 */
router.get('/check-feature/:featureKey', authenticate, attachPrisma, async (req, res) => {
  try {
    const hasAccess = await hasFeatureAccess(req.user.id, req.params.featureKey, req.prisma);

    res.json({
      hasAccess,
      feature: req.params.featureKey
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/membership/check-limit/:metric
 * Check usage limit for a specific metric
 */
router.get('/check-limit/:metric', authenticate, attachPrisma, async (req, res) => {
  try {
    const limit = await checkUsageLimit(req.user.id, req.params.metric, req.prisma);

    res.json(limit);
  } catch (error) {
    console.error('Error checking usage limit:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/membership/change-tier
 * Upgrade or downgrade user's tier
 */
router.post('/change-tier', authenticate, attachPrisma, async (req, res) => {
  try {
    const { tierSlug } = req.body;

    if (!tierSlug) {
      return res.status(400).json({ error: 'tierSlug is required' });
    }

    // TODO: Handle Stripe subscription changes
    // This is simplified - real implementation needs:
    // 1. Create/update Stripe subscription
    // 2. Handle prorations
    // 3. Update payment method if needed
    // 4. Send confirmation email

    const newTier = await changeMembershipTier(req.user.id, tierSlug, req.prisma);

    res.json({
      message: 'Tier changed successfully',
      tier: newTier
    });
  } catch (error) {
    console.error('Error changing tier:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/membership/recommended-upgrade
 * Get recommended tier for upgrade based on feature need
 */
router.get('/recommended-upgrade', authenticate, attachPrisma, async (req, res) => {
  try {
    const { feature } = req.query;

    if (!feature) {
      return res.status(400).json({ error: 'feature parameter is required' });
    }

    const recommendedTier = await getRecommendedUpgradeTier(
      req.user.id,
      feature,
      req.prisma
    );

    if (!recommendedTier) {
      return res.status(404).json({ error: 'No upgrade tier found' });
    }

    res.json(recommendedTier);
  } catch (error) {
    console.error('Error getting recommended upgrade:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/membership/addons
 * Get available add-ons (and user's purchased add-ons)
 */
router.get('/addons', authenticate, attachPrisma, async (req, res) => {
  try {
    const addOns = await req.prisma.addOn.findMany({
      where: { isActive: true }
    });

    // Get user's purchased add-ons
    const purchases = await req.prisma.addOnPurchase.findMany({
      where: {
        userId: req.user.id,
        status: 'ACTIVE'
      }
    });

    const purchasedIds = purchases.map(p => p.addOnId);

    const addOnsWithStatus = addOns.map(addOn => ({
      ...addOn,
      purchased: purchasedIds.includes(addOn.id)
    }));

    res.json(addOnsWithStatus);
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/membership/addons/:addOnId/purchase
 * Purchase an add-on
 */
router.post('/addons/:addOnId/purchase', authenticate, attachPrisma, async (req, res) => {
  try {
    const { addOnId } = req.params;

    // Check if add-on exists
    const addOn = await req.prisma.addOn.findUnique({
      where: { id: addOnId }
    });

    if (!addOn || !addOn.isActive) {
      return res.status(404).json({ error: 'Add-on not found or inactive' });
    }

    // Check if already purchased
    const existing = await req.prisma.addOnPurchase.findUnique({
      where: {
        userId_addOnId: {
          userId: req.user.id,
          addOnId
        }
      }
    });

    if (existing && existing.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Add-on already purchased' });
    }

    // TODO: Process payment with Stripe
    // This is simplified - real implementation needs:
    // 1. Create Stripe subscription item
    // 2. Handle payment
    // 3. Send confirmation email

    const purchase = await req.prisma.addOnPurchase.create({
      data: {
        userId: req.user.id,
        addOnId,
        status: 'ACTIVE'
      },
      include: { addOn: true }
    });

    res.json({
      message: 'Add-on purchased successfully',
      purchase
    });
  } catch (error) {
    console.error('Error purchasing add-on:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/membership/addons/:addOnId/cancel
 * Cancel an add-on subscription
 */
router.post('/addons/:addOnId/cancel', authenticate, attachPrisma, async (req, res) => {
  try {
    const { addOnId } = req.params;

    const purchase = await req.prisma.addOnPurchase.findUnique({
      where: {
        userId_addOnId: {
          userId: req.user.id,
          addOnId
        }
      }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Add-on purchase not found' });
    }

    if (purchase.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Add-on is not active' });
    }

    // TODO: Cancel Stripe subscription item

    const updated = await req.prisma.addOnPurchase.update({
      where: {
        userId_addOnId: {
          userId: req.user.id,
          addOnId
        }
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      },
      include: { addOn: true }
    });

    res.json({
      message: 'Add-on cancelled successfully',
      purchase: updated
    });
  } catch (error) {
    console.error('Error cancelling add-on:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/membership/features
 * Get all available features
 */
router.get('/features', attachPrisma, async (req, res) => {
  try {
    const features = await req.prisma.feature.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group by category
    const grouped = features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    }, {});

    res.json({
      features,
      grouped
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/membership/increment-usage
 * Manually increment usage (for testing or admin purposes)
 */
router.post('/increment-usage', authenticate, attachPrisma, async (req, res) => {
  try {
    const { metric, amount = 1 } = req.body;

    if (!metric) {
      return res.status(400).json({ error: 'metric is required' });
    }

    await incrementUsage(req.user.id, metric, amount, req.prisma);

    const updated = await checkUsageLimit(req.user.id, metric, req.prisma);

    res.json({
      message: 'Usage incremented',
      usage: updated
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
