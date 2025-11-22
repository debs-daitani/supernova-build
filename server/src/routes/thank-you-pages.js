/**
 * Phase 2BD: Thank You Pages
 * Backend API - Thank you pages, upsells, surveys, analytics
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substr(2, 6);
}

// ============================================
// THANK YOU PAGES - CRUD
// ============================================

/**
 * GET /api/thank-you-pages
 * Get all thank you pages for user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const pages = await prisma.thankYouPage.findMany({
      where: {
        userId: req.user.userId
      },
      include: {
        checkoutPage: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            views: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ pages });
  } catch (error) {
    console.error('Get thank you pages error:', error);
    res.status(500).json({ error: 'Failed to fetch thank you pages' });
  }
});

/**
 * GET /api/thank-you-pages/:id
 * Get single thank you page
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const page = await prisma.thankYouPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: {
        checkoutPage: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    res.json({ page });
  } catch (error) {
    console.error('Get thank you page error:', error);
    res.status(500).json({ error: 'Failed to fetch thank you page' });
  }
});

/**
 * POST /api/thank-you-pages
 * Create thank you page
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      checkoutPageId,
      sections,
      hasUpsell,
      upsellOffer,
      hasDownsell,
      downsellOffer,
      enableSharing,
      shareMessage,
      shareIncentive,
      showCommunityJoin,
      communityName,
      communityUrl,
      showNextSteps,
      nextSteps,
      enableCalendar,
      calendlyUrl,
      enableSurvey,
      surveyQuestions,
      facebookPixelId,
      googleAnalyticsId,
      customTrackingCode,
      theme,
      customCSS
    } = req.body;

    const slug = generateSlug(name);

    const page = await prisma.thankYouPage.create({
      data: {
        userId: req.user.userId,
        name,
        slug,
        checkoutPageId: checkoutPageId || null,
        sections: sections || [],
        hasUpsell: hasUpsell || false,
        upsellOffer: upsellOffer || null,
        hasDownsell: hasDownsell || false,
        downsellOffer: downsellOffer || null,
        enableSharing: enableSharing !== false,
        shareMessage,
        shareIncentive,
        showCommunityJoin: showCommunityJoin || false,
        communityName,
        communityUrl,
        showNextSteps: showNextSteps !== false,
        nextSteps: nextSteps || [],
        enableCalendar: enableCalendar || false,
        calendlyUrl,
        enableSurvey: enableSurvey || false,
        surveyQuestions: surveyQuestions || [],
        facebookPixelId,
        googleAnalyticsId,
        customTrackingCode,
        theme: theme || 'celebration',
        customCSS
      }
    });

    res.status(201).json({ page });
  } catch (error) {
    console.error('Create thank you page error:', error);
    res.status(500).json({ error: 'Failed to create thank you page' });
  }
});

/**
 * PATCH /api/thank-you-pages/:id
 * Update thank you page
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const page = await prisma.thankYouPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId;
    delete updateData.slug;
    delete updateData.createdAt;

    const updatedPage = await prisma.thankYouPage.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ page: updatedPage });
  } catch (error) {
    console.error('Update thank you page error:', error);
    res.status(500).json({ error: 'Failed to update thank you page' });
  }
});

/**
 * DELETE /api/thank-you-pages/:id
 * Delete thank you page
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const page = await prisma.thankYouPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    await prisma.thankYouPage.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Thank you page deleted successfully' });
  } catch (error) {
    console.error('Delete thank you page error:', error);
    res.status(500).json({ error: 'Failed to delete thank you page' });
  }
});

/**
 * POST /api/thank-you-pages/:id/publish
 * Publish thank you page
 */
router.post('/:id/publish', authenticate, async (req, res) => {
  try {
    const page = await prisma.thankYouPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    const updatedPage = await prisma.thankYouPage.update({
      where: { id: req.params.id },
      data: {
        isPublished: true
      }
    });

    res.json({ page: updatedPage });
  } catch (error) {
    console.error('Publish thank you page error:', error);
    res.status(500).json({ error: 'Failed to publish thank you page' });
  }
});

/**
 * POST /api/thank-you-pages/:id/unpublish
 * Unpublish thank you page
 */
router.post('/:id/unpublish', authenticate, async (req, res) => {
  try {
    const page = await prisma.thankYouPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    const updatedPage = await prisma.thankYouPage.update({
      where: { id: req.params.id },
      data: {
        isPublished: false
      }
    });

    res.json({ page: updatedPage });
  } catch (error) {
    console.error('Unpublish thank you page error:', error);
    res.status(500).json({ error: 'Failed to unpublish thank you page' });
  }
});

// ============================================
// PUBLIC THANK YOU PAGE
// ============================================

/**
 * GET /api/thank-you-pages/public/:slug
 * Get published thank you page by slug (public, requires orderId)
 */
router.get('/public/:slug', async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    const page = await prisma.thankYouPage.findUnique({
      where: {
        slug: req.params.slug
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    if (!page.isPublished) {
      return res.status(404).json({ error: 'Thank you page not published' });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if view already exists
    const existingView = await prisma.thankYouPageView.findFirst({
      where: {
        pageId: page.id,
        orderId: order.id
      }
    });

    if (!existingView) {
      // Create view record
      await prisma.thankYouPageView.create({
        data: {
          pageId: page.id,
          orderId: order.id
        }
      });
    }

    res.json({ page, order });
  } catch (error) {
    console.error('Get public thank you page error:', error);
    res.status(500).json({ error: 'Failed to fetch thank you page' });
  }
});

/**
 * POST /api/thank-you-pages/:id/upsell-accept
 * Accept upsell offer
 */
router.post('/:id/upsell-accept', async (req, res) => {
  try {
    const { orderId, upsellProductId, upsellPrice } = req.body;

    const page = await prisma.thankYouPage.findUnique({
      where: { id: req.params.id }
    });

    if (!page || !page.isPublished) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // In production, process Stripe payment here
    // const charge = await stripe.paymentIntents.create({ ... });

    // Add upsell to order
    const currentItems = Array.isArray(order.items) ? order.items : [];
    const upsellItem = {
      productId: upsellProductId,
      name: page.upsellOffer?.productName || 'Upsell Product',
      price: parseFloat(upsellPrice),
      quantity: 1,
      isUpsell: true
    };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        items: [...currentItems, upsellItem],
        total: order.total + parseFloat(upsellPrice)
      }
    });

    // Track upsell acceptance
    await prisma.thankYouPageView.updateMany({
      where: {
        pageId: page.id,
        orderId: order.id
      },
      data: {
        upsellAccepted: true
      }
    });

    res.json({ success: true, message: 'Upsell added to order' });
  } catch (error) {
    console.error('Accept upsell error:', error);
    res.status(500).json({ error: 'Failed to process upsell' });
  }
});

/**
 * POST /api/thank-you-pages/:id/downsell-accept
 * Accept downsell offer
 */
router.post('/:id/downsell-accept', async (req, res) => {
  try {
    const { orderId, downsellProductId, downsellPrice } = req.body;

    const page = await prisma.thankYouPage.findUnique({
      where: { id: req.params.id }
    });

    if (!page || !page.isPublished) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Process downsell (similar to upsell)
    const currentItems = Array.isArray(order.items) ? order.items : [];
    const downsellItem = {
      productId: downsellProductId,
      name: page.downsellOffer?.productName || 'Downsell Product',
      price: parseFloat(downsellPrice),
      quantity: 1,
      isDownsell: true
    };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        items: [...currentItems, downsellItem],
        total: order.total + parseFloat(downsellPrice)
      }
    });

    // Track downsell acceptance
    await prisma.thankYouPageView.updateMany({
      where: {
        pageId: page.id,
        orderId: order.id
      },
      data: {
        downsellAccepted: true
      }
    });

    res.json({ success: true, message: 'Downsell added to order' });
  } catch (error) {
    console.error('Accept downsell error:', error);
    res.status(500).json({ error: 'Failed to process downsell' });
  }
});

/**
 * POST /api/thank-you-pages/:id/share
 * Track social share
 */
router.post('/:id/share', async (req, res) => {
  try {
    const { orderId, platform } = req.body;

    const page = await prisma.thankYouPage.findUnique({
      where: { id: req.params.id }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    // Track share
    await prisma.thankYouPageView.updateMany({
      where: {
        pageId: page.id,
        orderId: orderId || undefined
      },
      data: {
        shared: true
      }
    });

    res.json({ success: true, message: 'Share tracked' });
  } catch (error) {
    console.error('Track share error:', error);
    res.status(500).json({ error: 'Failed to track share' });
  }
});

/**
 * POST /api/thank-you-pages/:id/survey
 * Submit post-purchase survey
 */
router.post('/:id/survey', async (req, res) => {
  try {
    const { orderId, responses, canUseAsTestimonial } = req.body;

    const page = await prisma.thankYouPage.findUnique({
      where: { id: req.params.id }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    // Save survey
    await prisma.postPurchaseSurvey.create({
      data: {
        orderId,
        responses: responses || {},
        canUseAsTestimonial: canUseAsTestimonial || false
      }
    });

    // Track survey completion
    await prisma.thankYouPageView.updateMany({
      where: {
        pageId: page.id,
        orderId
      },
      data: {
        surveyCompleted: true
      }
    });

    res.json({ success: true, message: 'Survey submitted' });
  } catch (error) {
    console.error('Submit survey error:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

/**
 * POST /api/thank-you-pages/:id/calendar-booked
 * Track calendar booking
 */
router.post('/:id/calendar-booked', async (req, res) => {
  try {
    const { orderId } = req.body;

    const page = await prisma.thankYouPage.findUnique({
      where: { id: req.params.id }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    // Track calendar booking
    await prisma.thankYouPageView.updateMany({
      where: {
        pageId: page.id,
        orderId
      },
      data: {
        calendarBooked: true
      }
    });

    res.json({ success: true, message: 'Calendar booking tracked' });
  } catch (error) {
    console.error('Track calendar booking error:', error);
    res.status(500).json({ error: 'Failed to track calendar booking' });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/thank-you-pages/:id/analytics
 * Get thank you page analytics
 */
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const page = await prisma.thankYouPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Thank you page not found' });
    }

    // Get all views
    const views = await prisma.thankYouPageView.findMany({
      where: {
        pageId: page.id
      },
      include: {
        order: {
          select: {
            total: true,
            createdAt: true
          }
        }
      }
    });

    const totalViews = views.length;
    const upsellAcceptances = views.filter(v => v.upsellAccepted).length;
    const downsellAcceptances = views.filter(v => v.downsellAccepted).length;
    const shares = views.filter(v => v.shared).length;
    const surveyCompletions = views.filter(v => v.surveyCompleted).length;
    const calendarBookings = views.filter(v => v.calendarBooked).length;

    // Calculate additional revenue from upsells/downsells
    // This would need to track the actual amounts in production
    const upsellRate = totalViews > 0 ? (upsellAcceptances / totalViews) * 100 : 0;
    const downsellRate = totalViews > 0 ? (downsellAcceptances / totalViews) * 100 : 0;
    const shareRate = totalViews > 0 ? (shares / totalViews) * 100 : 0;
    const surveyRate = totalViews > 0 ? (surveyCompletions / totalViews) * 100 : 0;
    const calendarRate = totalViews > 0 ? (calendarBookings / totalViews) * 100 : 0;

    // Get survey responses
    const surveys = await prisma.postPurchaseSurvey.findMany({
      where: {
        orderId: {
          in: views.map(v => v.orderId).filter(Boolean)
        }
      }
    });

    res.json({
      overview: {
        totalViews,
        upsellAcceptances,
        upsellRate: upsellRate.toFixed(1),
        downsellAcceptances,
        downsellRate: downsellRate.toFixed(1),
        shares,
        shareRate: shareRate.toFixed(1),
        surveyCompletions,
        surveyRate: surveyRate.toFixed(1),
        calendarBookings,
        calendarRate: calendarRate.toFixed(1)
      },
      recentViews: views.slice(0, 10),
      surveys: surveys.slice(0, 10)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
