const express = require('express');
const router = express.Router();
const {
  getAllTiers,
  getUserSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getAllUsageStats,
} = require('../services/subscriptionService');
const { getUsageSummary } = require('../services/usageService');
const { requireSubscription } = require('../middleware/subscription');

/**
 * Subscription Routes
 * Handles subscription management endpoints
 */

/**
 * GET /subscription/tiers
 * Get all available subscription tiers
 */
router.get('/tiers', async (req, res, next) => {
  try {
    const tiers = await getAllTiers();

    res.json({
      success: true,
      data: {
        tiers,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /subscription/my
 * Get current user's subscription
 */
router.get('/my', async (req, res, next) => {
  try {
    // TODO: Get userId from authenticated user (req.user.id)
    const userId = req.user?.id || req.query?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User ID required',
        },
      });
    }

    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No subscription found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /subscription/create
 * Create a new subscription for user
 */
router.post('/create', async (req, res, next) => {
  try {
    const { userId, tierName, stripeCustomerId, stripeSubscriptionId } = req.body;

    if (!userId || !tierName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userId and tierName are required',
        },
      });
    }

    const subscription = await createSubscription(userId, tierName, {
      stripeCustomerId,
      stripeSubscriptionId,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /subscription/upgrade
 * Upgrade/change user's subscription tier
 */
router.post('/upgrade', async (req, res, next) => {
  try {
    const { userId, tierName } = req.body;

    if (!userId || !tierName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userId and tierName are required',
        },
      });
    }

    const subscription = await updateSubscription(userId, tierName);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /subscription/cancel
 * Cancel user's subscription (at period end)
 */
router.post('/cancel', async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userId is required',
        },
      });
    }

    const subscription = await cancelSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription will be canceled at period end',
      data: {
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /subscription/usage
 * Get current usage statistics for user
 */
router.get('/usage', async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User ID required',
        },
      });
    }

    const usage = await getAllUsageStats(userId);

    res.json({
      success: true,
      data: {
        usage,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /subscription/usage/summary
 * Get usage summary for user
 */
router.get('/usage/summary', async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User ID required',
        },
      });
    }

    const summary = await getUsageSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
