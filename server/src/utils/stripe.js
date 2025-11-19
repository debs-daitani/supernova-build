/**
 * Phase 2BG: Payment & Subscription System
 * Stripe Integration Utilities
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// Price IDs (set in environment variables)
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  SUPERNOVA_LTE: process.env.STRIPE_PRICE_SUPERNOVA_LTE || 'price_supernova_lte'
};

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

/**
 * Get or create Stripe customer
 */
export async function getOrCreateCustomer(user) {
  // Check if customer already exists
  if (user.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!customer.deleted) {
        return customer;
      }
    } catch (error) {
      console.error('Error retrieving customer:', error);
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id
    }
  });

  // Save customer ID
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id }
  });

  return customer;
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Create subscription
 */
export async function createSubscription(userId, planType, paymentMethodId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get or create customer
  const customer = await getOrCreateCustomer(user);

  // Attach payment method
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id
  });

  // Set as default payment method
  await stripe.customers.update(customer.id, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  });

  // Get price ID
  let priceId;
  switch (planType) {
    case 'pro_monthly':
      priceId = STRIPE_PRICES.PRO_MONTHLY;
      break;
    case 'pro_yearly':
      priceId = STRIPE_PRICES.PRO_YEARLY;
      break;
    case 'supernova_lte':
      priceId = STRIPE_PRICES.SUPERNOVA_LTE;
      break;
    default:
      throw new Error('Invalid plan type');
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_settings: {
      save_default_payment_method: 'on_subscription',
      payment_method_types: ['card']
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      userId: user.id,
      planType
    }
  });

  // Get payment method details
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  const last4 = paymentMethod.card?.last4 || '';

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      planType,
      planStatus: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      hasPaymentMethod: true,
      defaultPaymentMethod: last4,
      trialEndDate: null // Clear trial
    }
  });

  return subscription;
}

/**
 * Update subscription (change plan)
 */
export async function updateSubscription(userId, newPlanType) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.stripeSubscriptionId) {
    throw new Error('No active subscription');
  }

  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

  // Get new price ID
  let newPriceId;
  switch (newPlanType) {
    case 'pro_monthly':
      newPriceId = STRIPE_PRICES.PRO_MONTHLY;
      break;
    case 'pro_yearly':
      newPriceId = STRIPE_PRICES.PRO_YEARLY;
      break;
    case 'supernova_lte':
      newPriceId = STRIPE_PRICES.SUPERNOVA_LTE;
      break;
    default:
      throw new Error('Invalid plan type');
  }

  // Update subscription
  const updatedSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId
    }],
    proration_behavior: 'create_prorations',
    metadata: {
      ...subscription.metadata,
      planType: newPlanType
    }
  });

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      planType: newPlanType,
      currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
    }
  });

  return updatedSubscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId, immediately = false) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.stripeSubscriptionId) {
    throw new Error('No active subscription');
  }

  if (immediately) {
    // Cancel immediately
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        planStatus: 'canceled',
        planType: 'trial',
        cancelAtPeriodEnd: false
      }
    });
  } else {
    // Cancel at period end
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: true }
    });
  }

  return true;
}

/**
 * Reactivate subscription (undo cancel at period end)
 */
export async function reactivateSubscription(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.stripeSubscriptionId) {
    throw new Error('No subscription to reactivate');
  }

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: false
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      cancelAtPeriodEnd: false,
      planStatus: 'active'
    }
  });

  return true;
}

// ============================================
// PAYMENT METHOD MANAGEMENT
// ============================================

/**
 * Add payment method
 */
export async function addPaymentMethod(userId, paymentMethodId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const customer = await getOrCreateCustomer(user);

  // Attach payment method
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id
  });

  // Set as default
  await stripe.customers.update(customer.id, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  });

  // Get payment method details
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  const last4 = paymentMethod.card?.last4 || '';

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      hasPaymentMethod: true,
      defaultPaymentMethod: last4
    }
  });

  return paymentMethod;
}

/**
 * Get payment methods
 */
export async function getPaymentMethods(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.stripeCustomerId) {
    return [];
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: 'card'
  });

  return paymentMethods.data;
}

/**
 * Remove payment method
 */
export async function removePaymentMethod(userId, paymentMethodId) {
  await stripe.paymentMethods.detach(paymentMethodId);
  return true;
}

// ============================================
// REFUND PROCESSING
// ============================================

/**
 * Process refund
 */
export async function processRefund(userId, amount = null, reason = null) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get latest successful payment
  const latestPayment = await prisma.payment.findFirst({
    where: {
      userId,
      status: 'succeeded'
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!latestPayment) {
    throw new Error('No payment to refund');
  }

  // Create refund in Stripe
  const refund = await stripe.refunds.create({
    payment_intent: latestPayment.stripePaymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // Full refund if null
    reason: reason || 'requested_by_customer'
  });

  const refundedAmount = refund.amount / 100;
  const isFullRefund = refundedAmount === latestPayment.amount;

  // Update payment record
  await prisma.payment.update({
    where: { id: latestPayment.id },
    data: {
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      refundedAmount,
      refundReason: reason
    }
  });

  // Cancel subscription if full refund
  if (isFullRefund) {
    await cancelSubscription(userId, true);
  }

  return refund;
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

/**
 * Get invoices for user
 */
export async function getInvoices(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.stripeCustomerId) {
    return [];
  }

  const invoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 100
  });

  return invoices.data;
}

/**
 * Get single invoice
 */
export async function getInvoice(invoiceId) {
  return await stripe.invoices.retrieve(invoiceId);
}

// ============================================
// BILLING PORTAL
// ============================================

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(userId, returnUrl) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.stripeCustomerId) {
    throw new Error('No Stripe customer');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl
  });

  return session;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(planType) {
  const names = {
    trial: '7-Day Free Trial',
    pro_monthly: 'Pro Monthly',
    pro_yearly: 'Pro Yearly',
    supernova_lte: 'SUPERNova LTE'
  };
  return names[planType] || planType;
}

/**
 * Get plan price
 */
export function getPlanPrice(planType) {
  const prices = {
    trial: 0,
    pro_monthly: 26,
    pro_yearly: 260,
    supernova_lte: 50 // Example price
  };
  return prices[planType] || 0;
}

/**
 * Calculate trial days remaining
 */
export function getTrialDaysRemaining(trialEndDate) {
  if (!trialEndDate) return 0;

  const now = new Date();
  const end = new Date(trialEndDate);
  const diff = end - now;

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default {
  // Customer
  getOrCreateCustomer,

  // Subscriptions
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,

  // Payment Methods
  addPaymentMethod,
  getPaymentMethods,
  removePaymentMethod,

  // Refunds
  processRefund,

  // Invoices
  getInvoices,
  getInvoice,

  // Billing Portal
  createBillingPortalSession,

  // Helpers
  formatCurrency,
  getPlanDisplayName,
  getPlanPrice,
  getTrialDaysRemaining,

  // Stripe instance (for direct use)
  stripe
};
