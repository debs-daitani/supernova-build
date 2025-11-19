/**
 * Phase 2BC: Checkout Pages
 * Backend API - Checkout pages, orders, payments, coupons
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

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

/**
 * Generate order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Calculate total from items
 */
function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);
}

/**
 * Apply coupon discount
 */
async function applyCoupon(couponCode, subtotal, userId = null) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode }
  });

  if (!coupon) {
    throw new Error('Coupon not found');
  }

  if (!coupon.isActive) {
    throw new Error('Coupon is not active');
  }

  // Check expiry
  const now = new Date();
  if (coupon.startDate && now < new Date(coupon.startDate)) {
    throw new Error('Coupon not yet valid');
  }
  if (coupon.expiryDate && now > new Date(coupon.expiryDate)) {
    throw new Error('Coupon has expired');
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached');
  }

  // Check minimum purchase
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    throw new Error(`Minimum purchase of £${coupon.minPurchase} required`);
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    // Apply max discount cap if set
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    // Fixed amount
    discount = coupon.discountValue;
  }

  // Discount can't exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return {
    discount,
    coupon
  };
}

/**
 * Calculate conversion rate
 */
function calculateConversionRate(completedOrders, checkouts) {
  if (checkouts === 0) return 0;
  return (completedOrders / checkouts) * 100;
}

// ============================================
// CHECKOUT PAGES - CRUD
// ============================================

/**
 * GET /api/checkout/pages
 * Get all checkout pages for user
 */
router.get('/pages', authenticateToken, async (req, res) => {
  try {
    const pages = await prisma.checkoutPage.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ pages });
  } catch (error) {
    console.error('Get checkout pages error:', error);
    res.status(500).json({ error: 'Failed to fetch checkout pages' });
  }
});

/**
 * GET /api/checkout/pages/:id
 * Get single checkout page
 */
router.get('/pages/:id', authenticateToken, async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    res.json({ page });
  } catch (error) {
    console.error('Get checkout page error:', error);
    res.status(500).json({ error: 'Failed to fetch checkout page' });
  }
});

/**
 * POST /api/checkout/pages
 * Create checkout page
 */
router.post('/pages', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      productType,
      productIds,
      basePrice,
      currency,
      allowOneTime,
      allowSubscription,
      subscriptionInterval,
      allowPaymentPlan,
      paymentPlanConfig,
      hasUpsell,
      upsellOffer,
      orderBumps,
      allowCoupons,
      sections,
      showGuarantee,
      guaranteeText,
      showSecurity,
      showTestimonials,
      testimonials,
      theme,
      customCSS,
      metaTitle,
      metaDescription
    } = req.body;

    const slug = generateSlug(name);

    const page = await prisma.checkoutPage.create({
      data: {
        userId: req.user.userId,
        name,
        slug,
        productType,
        productIds: productIds || [],
        basePrice: parseFloat(basePrice),
        currency: currency || 'GBP',
        allowOneTime: allowOneTime !== false,
        allowSubscription: allowSubscription || false,
        subscriptionInterval,
        allowPaymentPlan: allowPaymentPlan || false,
        paymentPlanConfig: paymentPlanConfig || null,
        hasUpsell: hasUpsell || false,
        upsellOffer: upsellOffer || null,
        orderBumps: orderBumps || [],
        allowCoupons: allowCoupons !== false,
        sections: sections || [],
        showGuarantee: showGuarantee !== false,
        guaranteeText,
        showSecurity: showSecurity !== false,
        showTestimonials: showTestimonials || false,
        testimonials: testimonials || [],
        theme: theme || 'default',
        customCSS,
        metaTitle,
        metaDescription
      }
    });

    res.status(201).json({ page });
  } catch (error) {
    console.error('Create checkout page error:', error);
    res.status(500).json({ error: 'Failed to create checkout page' });
  }
});

/**
 * PATCH /api/checkout/pages/:id
 * Update checkout page
 */
router.patch('/pages/:id', authenticateToken, async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId;
    delete updateData.slug;
    delete updateData.createdAt;
    delete updateData.views;
    delete updateData.checkouts;
    delete updateData.completedOrders;
    delete updateData.revenue;

    // Parse numeric fields
    if (updateData.basePrice) {
      updateData.basePrice = parseFloat(updateData.basePrice);
    }

    const updatedPage = await prisma.checkoutPage.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ page: updatedPage });
  } catch (error) {
    console.error('Update checkout page error:', error);
    res.status(500).json({ error: 'Failed to update checkout page' });
  }
});

/**
 * DELETE /api/checkout/pages/:id
 * Delete checkout page
 */
router.delete('/pages/:id', authenticateToken, async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    await prisma.checkoutPage.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Checkout page deleted successfully' });
  } catch (error) {
    console.error('Delete checkout page error:', error);
    res.status(500).json({ error: 'Failed to delete checkout page' });
  }
});

/**
 * POST /api/checkout/pages/:id/publish
 * Publish checkout page
 */
router.post('/pages/:id/publish', authenticateToken, async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    const updatedPage = await prisma.checkoutPage.update({
      where: { id: req.params.id },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });

    res.json({ page: updatedPage });
  } catch (error) {
    console.error('Publish checkout page error:', error);
    res.status(500).json({ error: 'Failed to publish checkout page' });
  }
});

/**
 * POST /api/checkout/pages/:id/unpublish
 * Unpublish checkout page
 */
router.post('/pages/:id/unpublish', authenticateToken, async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    const updatedPage = await prisma.checkoutPage.update({
      where: { id: req.params.id },
      data: {
        isPublished: false
      }
    });

    res.json({ page: updatedPage });
  } catch (error) {
    console.error('Unpublish checkout page error:', error);
    res.status(500).json({ error: 'Failed to unpublish checkout page' });
  }
});

/**
 * POST /api/checkout/pages/:id/duplicate
 * Duplicate checkout page
 */
router.post('/pages/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    const newSlug = generateSlug(page.name + ' Copy');

    const newPage = await prisma.checkoutPage.create({
      data: {
        userId: req.user.userId,
        name: page.name + ' (Copy)',
        slug: newSlug,
        productType: page.productType,
        productIds: page.productIds,
        basePrice: page.basePrice,
        currency: page.currency,
        allowOneTime: page.allowOneTime,
        allowSubscription: page.allowSubscription,
        subscriptionInterval: page.subscriptionInterval,
        allowPaymentPlan: page.allowPaymentPlan,
        paymentPlanConfig: page.paymentPlanConfig,
        hasUpsell: page.hasUpsell,
        upsellOffer: page.upsellOffer,
        orderBumps: page.orderBumps,
        allowCoupons: page.allowCoupons,
        sections: page.sections,
        showGuarantee: page.showGuarantee,
        guaranteeText: page.guaranteeText,
        showSecurity: page.showSecurity,
        showTestimonials: page.showTestimonials,
        testimonials: page.testimonials,
        theme: page.theme,
        customCSS: page.customCSS,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        isPublished: false
      }
    });

    res.status(201).json({ page: newPage });
  } catch (error) {
    console.error('Duplicate checkout page error:', error);
    res.status(500).json({ error: 'Failed to duplicate checkout page' });
  }
});

// ============================================
// PUBLIC CHECKOUT
// ============================================

/**
 * GET /api/checkout/public/:slug
 * Get published checkout page by slug (public)
 */
router.get('/public/:slug', async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findUnique({
      where: {
        slug: req.params.slug
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    if (!page.isPublished) {
      return res.status(404).json({ error: 'Checkout page not published' });
    }

    // Increment views
    await prisma.checkoutPage.update({
      where: { id: page.id },
      data: {
        views: { increment: 1 }
      }
    });

    res.json({ page });
  } catch (error) {
    console.error('Get public checkout page error:', error);
    res.status(500).json({ error: 'Failed to fetch checkout page' });
  }
});

/**
 * POST /api/checkout/:id/create-payment-intent
 * Create payment intent (start checkout)
 */
router.post('/:id/create-payment-intent', async (req, res) => {
  try {
    const { items, couponCode, customerEmail, visitorId } = req.body;

    const page = await prisma.checkoutPage.findUnique({
      where: { id: req.params.id }
    });

    if (!page || !page.isPublished) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    // Calculate subtotal
    const subtotal = calculateSubtotal(items);

    // Apply coupon if provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      try {
        const result = await applyCoupon(couponCode, subtotal);
        discount = result.discount;
        appliedCoupon = result.coupon;
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    const total = subtotal - discount;

    // Track checkout started
    await prisma.checkoutPage.update({
      where: { id: page.id },
      data: {
        checkouts: { increment: 1 }
      }
    });

    // Save abandoned checkout
    if (customerEmail && visitorId) {
      await prisma.abandonedCheckout.create({
        data: {
          checkoutPageId: page.id,
          visitorId,
          customerEmail,
          items,
          subtotal
        }
      });
    }

    // In production, create Stripe PaymentIntent here
    // const paymentIntent = await stripe.paymentIntents.create({ ... });

    res.json({
      subtotal,
      discount,
      total,
      currency: page.currency,
      // clientSecret: paymentIntent.client_secret
      clientSecret: 'demo_' + Math.random().toString(36)
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/checkout/:id/complete
 * Complete order
 */
router.post('/:id/complete', async (req, res) => {
  try {
    const {
      items,
      subtotal,
      discount,
      total,
      couponCode,
      paymentMethod,
      stripePaymentIntentId,
      customerEmail,
      customerName,
      billingAddress,
      customerId,
      visitorId
    } = req.body;

    const page = await prisma.checkoutPage.findUnique({
      where: { id: req.params.id }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        sellerId: page.userId,
        customerId: customerId || null,
        checkoutPageId: page.id,
        items,
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount) || 0,
        tax: 0,
        total: parseFloat(total),
        currency: page.currency,
        couponCode: couponCode || null,
        paymentMethod: paymentMethod || 'stripe',
        paymentStatus: 'paid',
        stripePaymentIntentId: stripePaymentIntentId || null,
        customerEmail,
        customerName,
        billingAddress: billingAddress || null,
        paidAt: new Date()
      }
    });

    // Update checkout page stats
    const newRevenue = page.revenue + parseFloat(total);
    const newCompletedOrders = page.completedOrders + 1;
    const newConversionRate = calculateConversionRate(newCompletedOrders, page.checkouts);

    await prisma.checkoutPage.update({
      where: { id: page.id },
      data: {
        completedOrders: newCompletedOrders,
        revenue: newRevenue,
        conversionRate: newConversionRate
      }
    });

    // Increment coupon usage if used
    if (couponCode) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: {
          usageCount: { increment: 1 }
        }
      });
    }

    // Mark abandoned checkout as recovered if exists
    if (visitorId) {
      await prisma.abandonedCheckout.updateMany({
        where: {
          checkoutPageId: page.id,
          visitorId,
          recovered: false
        },
        data: {
          recovered: true,
          recoveredAt: new Date()
        }
      });
    }

    // TODO: Send order confirmation email
    // TODO: Grant product access
    // TODO: Trigger webhooks

    res.status(201).json({ order });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// ============================================
// ORDERS MANAGEMENT
// ============================================

/**
 * GET /api/orders
 * Get orders (as seller)
 */
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const where = {
      sellerId: req.user.userId
    };

    if (status) {
      where.paymentStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:id
 * Get order details
 */
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        sellerId: req.user.userId
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        checkoutPage: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * POST /api/orders/:id/refund
 * Issue refund
 */
router.post('/orders/:id/refund', authenticateToken, async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        sellerId: req.user.userId
      },
      include: {
        checkoutPage: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({ error: 'Order already refunded' });
    }

    const refundAmount = amount ? parseFloat(amount) : order.total;

    // TODO: Process Stripe refund
    // const refund = await stripe.refunds.create({
    //   payment_intent: order.stripePaymentIntentId,
    //   amount: Math.round(refundAmount * 100)
    // });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'refunded'
      }
    });

    // Update checkout page stats
    const newRevenue = order.checkoutPage.revenue - refundAmount;
    const newCompletedOrders = order.checkoutPage.completedOrders - 1;
    const newConversionRate = calculateConversionRate(
      newCompletedOrders,
      order.checkoutPage.checkouts
    );

    await prisma.checkoutPage.update({
      where: { id: order.checkoutPageId },
      data: {
        revenue: Math.max(0, newRevenue),
        completedOrders: Math.max(0, newCompletedOrders),
        conversionRate: newConversionRate
      }
    });

    // TODO: Send refund confirmation email
    // TODO: Revoke product access

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error('Refund order error:', error);
    res.status(500).json({ error: 'Failed to refund order' });
  }
});

/**
 * POST /api/orders/:id/fulfill
 * Mark order as fulfilled
 */
router.post('/orders/:id/fulfill', authenticateToken, async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        sellerId: req.user.userId
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        fulfillmentStatus: 'completed',
        trackingNumber: trackingNumber || null,
        fulfilledAt: new Date()
      }
    });

    // TODO: Send fulfillment email with tracking

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error('Fulfill order error:', error);
    res.status(500).json({ error: 'Failed to fulfill order' });
  }
});

// ============================================
// COUPONS
// ============================================

/**
 * GET /api/coupons
 * Get all coupons for user
 */
router.get('/coupons', authenticateToken, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

/**
 * POST /api/coupons
 * Create coupon
 */
router.post('/coupons', authenticateToken, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      applicableProducts,
      usageLimit,
      perUserLimit,
      startDate,
      expiryDate,
      isActive
    } = req.body;

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        userId: req.user.userId,
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        applicableProducts: applicableProducts || [],
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : null,
        startDate: startDate ? new Date(startDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== false
      }
    });

    res.status(201).json({ coupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

/**
 * PATCH /api/coupons/:id
 * Update coupon
 */
router.patch('/coupons/:id', authenticateToken, async (req, res) => {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.userId;
    delete updateData.code;
    delete updateData.usageCount;
    delete updateData.createdAt;

    // Parse numeric fields
    if (updateData.discountValue) {
      updateData.discountValue = parseFloat(updateData.discountValue);
    }
    if (updateData.minPurchase) {
      updateData.minPurchase = parseFloat(updateData.minPurchase);
    }
    if (updateData.maxDiscount) {
      updateData.maxDiscount = parseFloat(updateData.maxDiscount);
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ coupon: updatedCoupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

/**
 * DELETE /api/coupons/:id
 * Delete coupon
 */
router.delete('/coupons/:id', authenticateToken, async (req, res) => {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    await prisma.coupon.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

/**
 * POST /api/coupons/validate
 * Validate coupon code (public)
 */
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const result = await applyCoupon(code, parseFloat(subtotal));

    res.json({
      valid: true,
      discount: result.discount,
      coupon: {
        code: result.coupon.code,
        description: result.coupon.description,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue
      }
    });
  } catch (error) {
    res.status(400).json({
      valid: false,
      error: error.message
    });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/checkout/:id/analytics
 * Get checkout page analytics
 */
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const page = await prisma.checkoutPage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Checkout page not found' });
    }

    // Get orders for this page
    const orders = await prisma.order.findMany({
      where: {
        checkoutPageId: page.id,
        paymentStatus: 'paid'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average order value
    const avgOrderValue = orders.length > 0
      ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
      : 0;

    // Get abandoned checkouts
    const abandonedCount = await prisma.abandonedCheckout.count({
      where: {
        checkoutPageId: page.id,
        recovered: false
      }
    });

    const recoveredCount = await prisma.abandonedCheckout.count({
      where: {
        checkoutPageId: page.id,
        recovered: true
      }
    });

    // Revenue over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.findMany({
      where: {
        checkoutPageId: page.id,
        paymentStatus: 'paid',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const revenueByDate = {};
    recentOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += order.total;
    });

    res.json({
      overview: {
        views: page.views,
        checkouts: page.checkouts,
        completedOrders: page.completedOrders,
        revenue: page.revenue,
        conversionRate: page.conversionRate || 0,
        avgOrderValue
      },
      abandonedCarts: {
        total: abandonedCount + recoveredCount,
        abandoned: abandonedCount,
        recovered: recoveredCount,
        recoveryRate: (abandonedCount + recoveredCount) > 0
          ? (recoveredCount / (abandonedCount + recoveredCount)) * 100
          : 0
      },
      revenueOverTime: revenueByDate,
      recentOrders: orders.slice(0, 10)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
