/**
 * Phase 2BA: Landing Page System
 * Backend API Routes - Conversion-optimized landing pages
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substr(2, 6);
}

/**
 * Get or create visitor ID from cookies
 */
function getVisitorId(req) {
  return req.cookies?.visitorId || req.headers['x-visitor-id'] || 'anonymous';
}

/**
 * Parse device info from user agent
 */
function parseDeviceInfo(userAgent) {
  const ua = userAgent || '';

  let device = 'desktop';
  if (/mobile/i.test(ua)) device = 'mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'tablet';

  let browser = 'unknown';
  if (/chrome/i.test(ua)) browser = 'chrome';
  else if (/safari/i.test(ua)) browser = 'safari';
  else if (/firefox/i.test(ua)) browser = 'firefox';
  else if (/edge/i.test(ua)) browser = 'edge';

  let os = 'unknown';
  if (/windows/i.test(ua)) os = 'windows';
  else if (/mac/i.test(ua)) os = 'macos';
  else if (/linux/i.test(ua)) os = 'linux';
  else if (/android/i.test(ua)) os = 'android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'ios';

  return { device, browser, os };
}

/**
 * Calculate conversion rate
 */
function calculateConversionRate(conversions, views) {
  if (views === 0) return 0;
  return (conversions / views) * 100;
}

// ============================================
// LANDING PAGE CRUD
// ============================================

/**
 * GET /api/landing-pages
 * Get all landing pages for authenticated user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const pages = await prisma.landingPage.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            pageViews: true,
            conversions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ pages });
  } catch (error) {
    console.error('Failed to get landing pages:', error);
    res.status(500).json({ error: 'Failed to get landing pages' });
  }
});

/**
 * GET /api/landing-pages/:id
 * Get single landing page
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const page = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    res.json({ page });
  } catch (error) {
    console.error('Failed to get landing page:', error);
    res.status(500).json({ error: 'Failed to get landing page' });
  }
});

/**
 * POST /api/landing-pages
 * Create new landing page
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      templateType,
      sections,
      metaTitle,
      metaDescription,
      ogImage,
      primaryCTA,
      ctaUrl
    } = req.body;

    if (!title || !templateType || !sections) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slug = generateSlug(title);

    const page = await prisma.landingPage.create({
      data: {
        userId: req.user.id,
        title,
        slug,
        templateType,
        sections,
        metaTitle: metaTitle || title,
        metaDescription,
        ogImage,
        primaryCTA: primaryCTA || 'Get Started',
        ctaUrl: ctaUrl || '/signup'
      }
    });

    res.json({ page });
  } catch (error) {
    console.error('Failed to create landing page:', error);
    res.status(500).json({ error: 'Failed to create landing page' });
  }
});

/**
 * PATCH /api/landing-pages/:id
 * Update landing page
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const {
      title,
      sections,
      metaTitle,
      metaDescription,
      ogImage,
      primaryCTA,
      ctaUrl,
      customCSS,
      customJS,
      headerCode,
      footerCode,
      exitIntentEnabled,
      exitIntentContent
    } = req.body;

    const page = await prisma.landingPage.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(sections && { sections }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(ogImage !== undefined && { ogImage }),
        ...(primaryCTA && { primaryCTA }),
        ...(ctaUrl && { ctaUrl }),
        ...(customCSS !== undefined && { customCSS }),
        ...(customJS !== undefined && { customJS }),
        ...(headerCode !== undefined && { headerCode }),
        ...(footerCode !== undefined && { footerCode }),
        ...(exitIntentEnabled !== undefined && { exitIntentEnabled }),
        ...(exitIntentContent !== undefined && { exitIntentContent })
      }
    });

    res.json({ page });
  } catch (error) {
    console.error('Failed to update landing page:', error);
    res.status(500).json({ error: 'Failed to update landing page' });
  }
});

/**
 * DELETE /api/landing-pages/:id
 * Delete landing page
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    await prisma.landingPage.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete landing page:', error);
    res.status(500).json({ error: 'Failed to delete landing page' });
  }
});

/**
 * POST /api/landing-pages/:id/publish
 * Publish landing page
 */
router.post('/:id/publish', authenticate, async (req, res) => {
  try {
    const existing = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const page = await prisma.landingPage.update({
      where: { id: req.params.id },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });

    res.json({ page });
  } catch (error) {
    console.error('Failed to publish landing page:', error);
    res.status(500).json({ error: 'Failed to publish landing page' });
  }
});

/**
 * POST /api/landing-pages/:id/unpublish
 * Unpublish landing page
 */
router.post('/:id/unpublish', authenticate, async (req, res) => {
  try {
    const existing = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const page = await prisma.landingPage.update({
      where: { id: req.params.id },
      data: {
        isPublished: false
      }
    });

    res.json({ page });
  } catch (error) {
    console.error('Failed to unpublish landing page:', error);
    res.status(500).json({ error: 'Failed to unpublish landing page' });
  }
});

/**
 * POST /api/landing-pages/:id/duplicate
 * Duplicate landing page
 */
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const existing = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const newSlug = generateSlug(existing.title + ' Copy');

    const page = await prisma.landingPage.create({
      data: {
        userId: req.user.id,
        title: existing.title + ' (Copy)',
        slug: newSlug,
        templateType: existing.templateType,
        sections: existing.sections,
        metaTitle: existing.metaTitle,
        metaDescription: existing.metaDescription,
        ogImage: existing.ogImage,
        primaryCTA: existing.primaryCTA,
        ctaUrl: existing.ctaUrl,
        customCSS: existing.customCSS,
        customJS: existing.customJS,
        headerCode: existing.headerCode,
        footerCode: existing.footerCode,
        exitIntentEnabled: existing.exitIntentEnabled,
        exitIntentContent: existing.exitIntentContent,
        isPublished: false
      }
    });

    res.json({ page });
  } catch (error) {
    console.error('Failed to duplicate landing page:', error);
    res.status(500).json({ error: 'Failed to duplicate landing page' });
  }
});

// ============================================
// A/B TESTING
// ============================================

/**
 * POST /api/landing-pages/:id/variants
 * Create A/B test variant
 */
router.post('/:id/variants', authenticate, async (req, res) => {
  try {
    const original = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!original) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const { trafficSplit } = req.body;
    const newSlug = generateSlug(original.title + ' Variant');

    const variant = await prisma.landingPage.create({
      data: {
        userId: req.user.id,
        title: original.title + ' (Variant)',
        slug: newSlug,
        templateType: original.templateType,
        sections: original.sections,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        ogImage: original.ogImage,
        primaryCTA: original.primaryCTA,
        ctaUrl: original.ctaUrl,
        customCSS: original.customCSS,
        customJS: original.customJS,
        isVariant: true,
        variantOf: original.id,
        trafficSplit: trafficSplit || 50,
        isPublished: original.isPublished
      }
    });

    res.json({ variant });
  } catch (error) {
    console.error('Failed to create variant:', error);
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

/**
 * GET /api/landing-pages/:id/test-results
 * Get A/B test results
 */
router.get('/:id/test-results', authenticate, async (req, res) => {
  try {
    const original = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!original) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // Get variants
    const variants = await prisma.landingPage.findMany({
      where: {
        variantOf: original.id,
        userId: req.user.id
      }
    });

    const results = {
      original: {
        id: original.id,
        title: original.title,
        views: original.views,
        conversions: original.conversions,
        conversionRate: original.conversionRate || 0
      },
      variants: variants.map(v => ({
        id: v.id,
        title: v.title,
        views: v.views,
        conversions: v.conversions,
        conversionRate: v.conversionRate || 0,
        trafficSplit: v.trafficSplit
      }))
    };

    res.json({ results });
  } catch (error) {
    console.error('Failed to get test results:', error);
    res.status(500).json({ error: 'Failed to get test results' });
  }
});

// ============================================
// PUBLIC PAGE SERVING
// ============================================

/**
 * GET /lp/:slug
 * View published landing page (public)
 */
router.get('/public/:slug', async (req, res) => {
  try {
    const page = await prisma.landingPage.findFirst({
      where: {
        slug: req.params.slug,
        isPublished: true
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page });
  } catch (error) {
    console.error('Failed to get public page:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
});

// ============================================
// TRACKING
// ============================================

/**
 * POST /api/landing-pages/:id/view
 * Track page view
 */
router.post('/:id/view', async (req, res) => {
  try {
    const {
      visitorId,
      userId,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body;

    const deviceInfo = parseDeviceInfo(req.headers['user-agent']);

    // Check if unique view
    const existingView = await prisma.landingPageView.findFirst({
      where: {
        pageId: req.params.id,
        visitorId: visitorId || 'anonymous'
      }
    });

    const isUnique = !existingView;

    // Log view
    await prisma.landingPageView.create({
      data: {
        pageId: req.params.id,
        visitorId: visitorId || 'anonymous',
        userId,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os
      }
    });

    // Update page stats
    await prisma.landingPage.update({
      where: { id: req.params.id },
      data: {
        views: { increment: 1 },
        ...(isUnique && { uniqueViews: { increment: 1 } })
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to track view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

/**
 * POST /api/landing-pages/:id/time
 * Update time on page and scroll depth
 */
router.post('/:id/time', async (req, res) => {
  try {
    const { visitorId, timeOnPage, scrollDepth } = req.body;

    // Find most recent view for this visitor
    const view = await prisma.landingPageView.findFirst({
      where: {
        pageId: req.params.id,
        visitorId: visitorId || 'anonymous'
      },
      orderBy: { viewedAt: 'desc' }
    });

    if (view) {
      await prisma.landingPageView.update({
        where: { id: view.id },
        data: {
          timeOnPage,
          scrollDepth
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update time/scroll:', error);
    res.status(500).json({ error: 'Failed to update metrics' });
  }
});

/**
 * POST /api/landing-pages/:id/convert
 * Track conversion
 */
router.post('/:id/convert', async (req, res) => {
  try {
    const {
      visitorId,
      userId,
      conversionType,
      value,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body;

    // Log conversion
    await prisma.landingPageConversion.create({
      data: {
        pageId: req.params.id,
        visitorId: visitorId || 'anonymous',
        userId,
        conversionType: conversionType || 'signup',
        value,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign
      }
    });

    // Update page stats
    const page = await prisma.landingPage.findUnique({
      where: { id: req.params.id }
    });

    const newConversions = page.conversions + 1;
    const conversionRate = calculateConversionRate(newConversions, page.views);

    await prisma.landingPage.update({
      where: { id: req.params.id },
      data: {
        conversions: newConversions,
        conversionRate
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to track conversion:', error);
    res.status(500).json({ error: 'Failed to track conversion' });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/landing-pages/:id/analytics
 * Get landing page analytics
 */
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const page = await prisma.landingPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // Get view stats
    const views = await prisma.landingPageView.findMany({
      where: { pageId: req.params.id }
    });

    // Get conversion stats
    const conversions = await prisma.landingPageConversion.findMany({
      where: { pageId: req.params.id }
    });

    // Calculate metrics
    const totalViews = page.views;
    const uniqueViews = page.uniqueViews;
    const totalConversions = page.conversions;
    const conversionRate = page.conversionRate || 0;

    // Average time on page
    const validViews = views.filter(v => v.timeOnPage);
    const avgTimeOnPage = validViews.length > 0
      ? validViews.reduce((sum, v) => sum + v.timeOnPage, 0) / validViews.length
      : 0;

    // Average scroll depth
    const scrollViews = views.filter(v => v.scrollDepth);
    const avgScrollDepth = scrollViews.length > 0
      ? scrollViews.reduce((sum, v) => sum + v.scrollDepth, 0) / scrollViews.length
      : 0;

    // Device breakdown
    const deviceBreakdown = views.reduce((acc, v) => {
      const device = v.device || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    // Traffic sources
    const sources = views.reduce((acc, v) => {
      const source = v.utmSource || v.referrer || 'direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Views over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsOverTime = await prisma.landingPageView.groupBy({
      by: ['viewedAt'],
      where: {
        pageId: req.params.id,
        viewedAt: { gte: thirtyDaysAgo }
      },
      _count: true
    });

    // Conversions over time
    const conversionsOverTime = await prisma.landingPageConversion.groupBy({
      by: ['convertedAt'],
      where: {
        pageId: req.params.id,
        convertedAt: { gte: thirtyDaysAgo }
      },
      _count: true
    });

    res.json({
      analytics: {
        overview: {
          totalViews,
          uniqueViews,
          totalConversions,
          conversionRate,
          avgTimeOnPage: Math.round(avgTimeOnPage),
          avgScrollDepth: Math.round(avgScrollDepth)
        },
        deviceBreakdown,
        sources,
        viewsOverTime,
        conversionsOverTime
      }
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// ============================================
// TEMPLATES (ADMIN)
// ============================================

/**
 * GET /api/landing-pages/templates/all
 * Get all templates
 */
router.get('/templates/all', async (req, res) => {
  try {
    const templates = await prisma.landingPageTemplate.findMany({
      where: { isActive: true },
      orderBy: { avgConversionRate: 'desc' }
    });

    res.json({ templates });
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

/**
 * POST /api/landing-pages/templates
 * Create template (admin only)
 */
router.post('/templates', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      thumbnail,
      sections,
      isPremium
    } = req.body;

    const template = await prisma.landingPageTemplate.create({
      data: {
        name,
        description,
        category,
        thumbnail,
        sections,
        isPremium: isPremium || false
      }
    });

    res.json({ template });
  } catch (error) {
    console.error('Failed to create template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

export default router;
