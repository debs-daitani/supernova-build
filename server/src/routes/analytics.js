/**
 * Analytics Routes
 * All analytics tracking and reporting endpoints
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const aggregationService = require('../services/analyticsAggregationService');

const prisma = new PrismaClient();

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track an analytics event
 * POST /api/analytics/track
 */
router.post('/track', async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pagePath,
      pageTitle,
      referrer,
      utmParams,
      metadata
    } = req.body;

    // Get user ID from token if available
    const userId = req.user?.id;

    // Get IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await analyticsService.trackEvent(prisma, {
      userId,
      sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pagePath,
      pageTitle,
      referrer,
      utmParams,
      ipAddress,
      userAgent,
      metadata
    });

    res.json(result);
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create or update session
 * POST /api/analytics/session
 */
router.post('/session', async (req, res) => {
  try {
    const { sessionId, landingPage, referrer, utmParams } = req.body;
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await analyticsService.createSession(prisma, {
      sessionId,
      userId,
      landingPage,
      referrer,
      utmParams,
      ipAddress,
      userAgent
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * End session
 * POST /api/analytics/session/:sessionId/end
 */
router.post('/session/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await analyticsService.endSession(prisma, sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DASHBOARD & REPORTS
// ============================================================================

/**
 * Get dashboard overview
 * GET /api/analytics/dashboard?dateRange=last_7_days
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { dateRange = 'last_7_days' } = req.query;

    // Try to use aggregated data first for better performance
    const aggregatedStats = await aggregationService.getAggregatedStats(prisma, dateRange);

    if (aggregatedStats) {
      res.json({ success: true, data: aggregatedStats });
    } else {
      // Fallback to real-time calculation
      const stats = await analyticsService.getDashboardOverview(prisma, dateRange);
      res.json({ success: true, data: stats });
    }
  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get traffic sources
 * GET /api/analytics/traffic-sources?dateRange=last_7_days
 */
router.get('/traffic-sources', authenticateToken, async (req, res) => {
  try {
    const { dateRange = 'last_7_days' } = req.query;
    const sources = await analyticsService.getTrafficSources(prisma, dateRange);
    res.json({ success: true, sources });
  } catch (error) {
    console.error('Error getting traffic sources:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get top pages
 * GET /api/analytics/pages?dateRange=last_7_days&limit=10
 */
router.get('/pages', authenticateToken, async (req, res) => {
  try {
    const { dateRange = 'last_7_days', limit = 10 } = req.query;
    const pages = await analyticsService.getTopPages(prisma, dateRange, parseInt(limit));
    res.json({ success: true, pages });
  } catch (error) {
    console.error('Error getting top pages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get device breakdown
 * GET /api/analytics/devices?dateRange=last_7_days
 */
router.get('/devices', authenticateToken, async (req, res) => {
  try {
    const { dateRange = 'last_7_days' } = req.query;
    const devices = await analyticsService.getDeviceBreakdown(prisma, dateRange);
    res.json({ success: true, devices });
  } catch (error) {
    console.error('Error getting device breakdown:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get geographic distribution
 * GET /api/analytics/geo?dateRange=last_7_days
 */
router.get('/geo', authenticateToken, async (req, res) => {
  try {
    const { dateRange = 'last_7_days' } = req.query;
    const geo = await analyticsService.getGeographicData(prisma, dateRange);
    res.json({ success: true, geo });
  } catch (error) {
    console.error('Error getting geographic data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get visitors over time (for charts)
 * GET /api/analytics/visitors-over-time?dateRange=last_7_days
 */
router.get('/visitors-over-time', authenticateToken, async (req, res) => {
  try {
    const { dateRange = 'last_7_days' } = req.query;
    const data = await analyticsService.getVisitorsOverTime(prisma, dateRange);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting visitors over time:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get real-time active users
 * GET /api/analytics/active-users
 */
router.get('/active-users', authenticateToken, async (req, res) => {
  try {
    const activeUsers = await prisma.activeUser.findMany({
      orderBy: {
        lastActivity: 'desc'
      }
    });

    res.json({ success: true, count: activeUsers.length, users: activeUsers });
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CONVERSION FUNNELS
// ============================================================================

/**
 * Get all funnels
 * GET /api/analytics/funnels
 */
router.get('/funnels', authenticateToken, async (req, res) => {
  try {
    const funnels = await prisma.conversionFunnel.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      include: {
        _count: {
          select: { completions: true }
        }
      }
    });

    res.json({ success: true, funnels });
  } catch (error) {
    console.error('Error getting funnels:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create funnel
 * POST /api/analytics/funnels
 */
router.post('/funnels', authenticateToken, async (req, res) => {
  try {
    const { name, description, steps } = req.body;

    const funnel = await prisma.conversionFunnel.create({
      data: {
        userId: req.user.id,
        name,
        description,
        steps
      }
    });

    res.json({ success: true, funnel });
  } catch (error) {
    console.error('Error creating funnel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Track funnel progress
 * POST /api/analytics/funnels/:id/track
 */
router.post('/funnels/:id/track', async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId, step } = req.body;
    const userId = req.user?.id;

    const result = await analyticsService.trackFunnelProgress(prisma, id, userId, sessionId, step);
    res.json(result);
  } catch (error) {
    console.error('Error tracking funnel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get funnel statistics
 * GET /api/analytics/funnels/:id/stats
 */
router.get('/funnels/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const funnel = await prisma.conversionFunnel.findUnique({
      where: { id },
      include: {
        completions: true
      }
    });

    if (!funnel) {
      return res.status(404).json({ success: false, error: 'Funnel not found' });
    }

    const totalStarted = funnel.completions.length;
    const totalCompleted = funnel.completions.filter(c => c.isCompleted).length;
    const conversionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

    // Calculate drop-off at each step
    const stepStats = funnel.steps.map((step, index) => {
      const reachedStep = funnel.completions.filter(c =>
        c.completedSteps.includes(index)
      ).length;

      return {
        step: index,
        name: step.name,
        reached: reachedStep,
        percentage: totalStarted > 0 ? (reachedStep / totalStarted) * 100 : 0
      };
    });

    res.json({
      success: true,
      stats: {
        totalStarted,
        totalCompleted,
        conversionRate,
        stepStats
      }
    });
  } catch (error) {
    console.error('Error getting funnel stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete funnel
 * DELETE /api/analytics/funnels/:id
 */
router.delete('/funnels/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.conversionFunnel.delete({
      where: { id, userId: req.user.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GOALS
// ============================================================================

/**
 * Get all goals
 * GET /api/analytics/goals
 */
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await prisma.customGoal.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, goals });
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create goal
 * POST /api/analytics/goals
 */
router.post('/goals', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      targetMetric,
      targetValue,
      endDate,
      alertOnComplete,
      alertOnMilestone
    } = req.body;

    const goal = await prisma.customGoal.create({
      data: {
        userId: req.user.id,
        name,
        description,
        targetMetric,
        targetValue,
        endDate,
        alertOnComplete,
        alertOnMilestone
      }
    });

    res.json({ success: true, goal });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update goal progress
 * PATCH /api/analytics/goals/:id/progress
 */
router.patch('/goals/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentValue } = req.body;

    const goal = await prisma.customGoal.findUnique({
      where: { id }
    });

    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    // Check if goal is now completed
    const isCompleted = currentValue >= goal.targetValue;
    const updateData = { currentValue };

    if (isCompleted && !goal.isCompleted) {
      updateData.isCompleted = true;
      updateData.completedAt = new Date();
    }

    const updatedGoal = await prisma.customGoal.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, goal: updatedGoal });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete goal
 * DELETE /api/analytics/goals/:id
 */
router.delete('/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customGoal.delete({
      where: { id, userId: req.user.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CUSTOM REPORTS
// ============================================================================

/**
 * Get all custom reports
 * GET /api/analytics/reports
 */
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await prisma.customReport.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create custom report
 * POST /api/analytics/reports
 */
router.post('/reports', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      metrics,
      dimensions,
      filters,
      dateRange,
      isScheduled,
      scheduleFrequency,
      scheduleTo
    } = req.body;

    const report = await prisma.customReport.create({
      data: {
        userId: req.user.id,
        name,
        description,
        metrics,
        dimensions,
        filters,
        dateRange,
        isScheduled,
        scheduleFrequency,
        scheduleTo
      }
    });

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Run custom report
 * GET /api/analytics/reports/:id/run
 */
router.get('/reports/:id/run', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.customReport.findUnique({
      where: { id, userId: req.user.id }
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // This would execute the report based on metrics, dimensions, and filters
    // For now, return placeholder data
    res.json({
      success: true,
      report,
      data: {
        message: 'Report execution not yet implemented'
      }
    });
  } catch (error) {
    console.error('Error running report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete custom report
 * DELETE /api/analytics/reports/:id
 */
router.delete('/reports/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customReport.delete({
      where: { id, userId: req.user.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DATA EXPORT
// ============================================================================

/**
 * Export analytics data
 * GET /api/analytics/export?format=csv&dateRange=last_30_days
 */
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'csv', dateRange = 'last_30_days' } = req.query;

    // This would generate CSV/JSON export of analytics data
    res.json({
      success: true,
      message: 'Export functionality not yet implemented',
      format,
      dateRange
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PRIVACY & CONSENT
// ============================================================================

/**
 * Update consent status
 * POST /api/analytics/consent
 */
router.post('/consent', async (req, res) => {
  try {
    const { cookieId, hasConsented } = req.body;
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const consent = await prisma.analyticsConsent.upsert({
      where: { cookieId },
      update: {
        hasConsented,
        consentDate: hasConsented ? new Date() : null
      },
      create: {
        userId,
        ipAddress,
        cookieId,
        hasConsented,
        consentDate: hasConsented ? new Date() : null
      }
    });

    res.json({ success: true, consent });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Opt out of tracking
 * POST /api/analytics/opt-out
 */
router.post('/opt-out', async (req, res) => {
  try {
    const { cookieId } = req.body;

    await prisma.analyticsConsent.update({
      where: { cookieId },
      data: {
        hasOptedOut: true,
        optOutDate: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error opting out:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
