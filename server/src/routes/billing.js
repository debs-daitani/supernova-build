/**
 * Phase 2BG: Payment & Subscription System
 * Backend API - Billing and subscription routes
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import stripeUtils from '../utils/stripe.js';
import {
  getReceiptEmailTemplate,
  getPaymentFailedEmailTemplate,
  getCancellationEmailTemplate,
  getRefundEmailTemplate
} from '../utils/email-templates.js';

const router = express.Router();
const prisma = new PrismaClient();

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Get subscription status
 * GET /api/billing/subscription
 */
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const daysRemaining = user.trialEndDate
      ? stripeUtils.getTrialDaysRemaining(user.trialEndDate)
      : 0;

    res.json({
      planType: user.planType || 'trial',
      planStatus: user.planStatus,
      planDisplayName: stripeUtils.getPlanDisplayName(user.planType),
      planPrice: stripeUtils.getPlanPrice(user.planType),
      currentPeriodStart: user.currentPeriodStart,
      currentPeriodEnd: user.currentPeriodEnd,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      hasPaymentMethod: user.hasPaymentMethod,
      defaultPaymentMethod: user.defaultPaymentMethod,
      trialEndDate: user.trialEndDate,
      trialDaysRemaining: daysRemaining,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

/**
 * Create subscription (upgrade from trial)
 * POST /api/billing/subscribe
 */
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { planType, paymentMethodId } = req.body;

    if (!planType || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subscription = await stripeUtils.createSubscription(
      req.userId,
      planType,
      paymentMethodId
    );

    res.json({
      subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to create subscription' });
  }
});

/**
 * Update subscription (change plan)
 * PATCH /api/billing/subscription
 */
router.patch('/subscription', authenticate, async (req, res) => {
  try {
    const { newPlanType } = req.body;

    if (!newPlanType) {
      return res.status(400).json({ error: 'Missing plan type' });
    }

    const subscription = await stripeUtils.updateSubscription(req.userId, newPlanType);

    res.json({
      subscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to update subscription' });
  }
});

/**
 * Cancel subscription
 * POST /api/billing/cancel
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const { immediately, reason } = req.body;

    await stripeUtils.cancelSubscription(req.userId, immediately);

    // Log cancellation reason
    if (reason) {
      console.log(`User ${req.userId} canceled subscription. Reason: ${reason}`);
      // TODO: Store cancellation reason in database for analytics
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    // Send cancellation email
    try {
      const emailTemplate = getCancellationEmailTemplate(
        user.name,
        immediately,
        user.currentPeriodEnd
      );
      // await sendEmail(user.email, emailTemplate);
      console.log('Cancellation email would be sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      message: immediately
        ? 'Subscription canceled immediately'
        : 'Subscription will cancel at period end'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
});

/**
 * Reactivate subscription
 * POST /api/billing/reactivate
 */
router.post('/reactivate', authenticate, async (req, res) => {
  try {
    await stripeUtils.reactivateSubscription(req.userId);

    res.json({ message: 'Subscription reactivated successfully' });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to reactivate subscription' });
  }
});

// ============================================
// PAYMENT METHODS
// ============================================

/**
 * Get payment methods
 * GET /api/billing/payment-methods
 */
router.get('/payment-methods', authenticate, async (req, res) => {
  try {
    const paymentMethods = await stripeUtils.getPaymentMethods(req.userId);
    res.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

/**
 * Add payment method
 * POST /api/billing/payment-methods
 */
router.post('/payment-methods', authenticate, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Missing payment method ID' });
    }

    const paymentMethod = await stripeUtils.addPaymentMethod(req.userId, paymentMethodId);

    res.json({
      paymentMethod,
      message: 'Payment method added successfully'
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: error.message || 'Failed to add payment method' });
  }
});

/**
 * Remove payment method
 * DELETE /api/billing/payment-methods/:id
 */
router.delete('/payment-methods/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await stripeUtils.removePaymentMethod(req.userId, id);

    res.json({ message: 'Payment method removed successfully' });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({ error: error.message || 'Failed to remove payment method' });
  }
});

// ============================================
// INVOICES
// ============================================

/**
 * Get invoices
 * GET /api/billing/invoices
 */
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const invoices = await stripeUtils.getInvoices(req.userId);

    // Also get from database
    const dbInvoices = await prisma.invoice.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      stripeInvoices: invoices,
      invoices: dbInvoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

/**
 * Get single invoice
 * GET /api/billing/invoices/:id
 */
router.get('/invoices/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await stripeUtils.getInvoice(id);

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

// ============================================
// REFUNDS
// ============================================

/**
 * Request refund
 * POST /api/billing/refund
 */
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const refund = await stripeUtils.processRefund(req.userId, amount, reason);

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    // Send refund confirmation email
    try {
      const emailTemplate = getRefundEmailTemplate(user.name, refund.amount / 100);
      // await sendEmail(user.email, emailTemplate);
      console.log('Refund email would be sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send refund email:', emailError);
    }

    res.json({
      refund,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: error.message || 'Failed to process refund' });
  }
});

// ============================================
// BILLING PORTAL
// ============================================

/**
 * Create billing portal session
 * POST /api/billing/portal
 */
router.post('/portal', authenticate, async (req, res) => {
  try {
    const { returnUrl } = req.body;

    const session = await stripeUtils.createBillingPortalSession(
      req.userId,
      returnUrl || process.env.FRONTEND_URL
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create billing portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create billing portal session' });
  }
});

// ============================================
// PAYMENT HISTORY
// ============================================

/**
 * Get payment history
 * GET /api/billing/payments
 */
router.get('/payments', authenticate, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

export default router;
