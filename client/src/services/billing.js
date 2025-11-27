/**
 * Phase 2BG: Payment & Subscription System
 * Frontend Service - API client for billing and subscriptions
 */

import api from './api';

const billingService = {
  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Get subscription status
   */
  getSubscription: async () => {
    const response = await api.get('/billing/subscription');
    return response.data;
  },

  /**
   * Create subscription (upgrade from trial)
   */
  createSubscription: async (planType, paymentMethodId) => {
    const response = await api.post('/billing/subscribe', {
      planType,
      paymentMethodId
    });
    return response.data;
  },

  /**
   * Update subscription (change plan)
   */
  updateSubscription: async (newPlanType) => {
    const response = await api.patch('/billing/subscription', {
      newPlanType
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (immediately = false, reason = null) => {
    const response = await api.post('/billing/cancel', {
      immediately,
      reason
    });
    return response.data;
  },

  /**
   * Reactivate subscription
   */
  reactivateSubscription: async () => {
    const response = await api.post('/billing/reactivate');
    return response.data;
  },

  // ============================================
  // PAYMENT METHODS
  // ============================================

  /**
   * Get payment methods
   */
  getPaymentMethods: async () => {
    const response = await api.get('/billing/payment-methods');
    return response.data;
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (paymentMethodId) => {
    const response = await api.post('/billing/payment-methods', {
      paymentMethodId
    });
    return response.data;
  },

  /**
   * Remove payment method
   */
  removePaymentMethod: async (paymentMethodId) => {
    const response = await api.delete(`/billing/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  // ============================================
  // INVOICES
  // ============================================

  /**
   * Get invoices
   */
  getInvoices: async () => {
    const response = await api.get('/billing/invoices');
    return response.data;
  },

  /**
   * Get single invoice
   */
  getInvoice: async (invoiceId) => {
    const response = await api.get(`/billing/invoices/${invoiceId}`);
    return response.data;
  },

  // ============================================
  // PAYMENTS
  // ============================================

  /**
   * Get payment history
   */
  getPayments: async () => {
    const response = await api.get('/billing/payments');
    return response.data;
  },

  /**
   * Request refund
   */
  requestRefund: async (amount = null, reason = null) => {
    const response = await api.post('/billing/refund', {
      amount,
      reason
    });
    return response.data;
  },

  // ============================================
  // BILLING PORTAL
  // ============================================

  /**
   * Create billing portal session
   */
  createPortalSession: async (returnUrl = null) => {
    const response = await api.post('/billing/portal', {
      returnUrl: returnUrl || window.location.href
    });
    return response.data;
  },

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Get plan display name
   */
  getPlanDisplayName: (planType) => {
    const plans = {
      trial: '7-Day Free Trial',
      pro_monthly: 'PRO - Monthly',
      pro_yearly: 'PRO - Yearly',
      supernova_lte: 'SUPERNova LTE - Lifetime'
    };
    return plans[planType] || planType;
  },

  /**
   * Get plan price
   */
  getPlanPrice: (planType) => {
    const prices = {
      trial: 0,
      pro_monthly: 26,
      pro_yearly: 260,
      supernova_lte: 999
    };
    return prices[planType] || 0;
  },

  /**
   * Get plan price display
   */
  getPlanPriceDisplay: (planType) => {
    const price = billingService.getPlanPrice(planType);

    if (planType === 'trial') {
      return 'Free';
    }

    if (planType === 'pro_yearly') {
      return `£${price}/year (£${Math.round(price / 12)}/mo)`;
    }

    if (planType === 'supernova_lte') {
      return `£${price} one-time`;
    }

    return `£${price}/month`;
  },

  /**
   * Get plan savings
   */
  getPlanSavings: (planType) => {
    if (planType === 'pro_yearly') {
      const monthlyTotal = 26 * 12;
      const yearlyPrice = 260;
      const savings = monthlyTotal - yearlyPrice;
      const percentage = Math.round((savings / monthlyTotal) * 100);
      return {
        amount: savings,
        percentage,
        display: `Save £${savings} (${percentage}%)`
      };
    }
    return null;
  },

  /**
   * Get subscription status label
   */
  getStatusLabel: (status) => {
    const labels = {
      active: { text: 'Active', color: 'green' },
      trialing: { text: 'Trial', color: 'blue' },
      past_due: { text: 'Past Due', color: 'orange' },
      canceled: { text: 'Canceled', color: 'red' },
      incomplete: { text: 'Incomplete', color: 'yellow' },
      incomplete_expired: { text: 'Expired', color: 'red' },
      unpaid: { text: 'Unpaid', color: 'red' }
    };
    return labels[status] || { text: status, color: 'gray' };
  },

  /**
   * Format currency
   */
  formatCurrency: (amount, currency = 'GBP') => {
    const symbols = {
      GBP: '£',
      USD: '$',
      EUR: '€'
    };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  },

  /**
   * Format date
   */
  formatDate: (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Calculate days until renewal
   */
  getDaysUntilRenewal: (periodEndDate) => {
    if (!periodEndDate) return null;

    const now = new Date();
    const end = new Date(periodEndDate);
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  },

  /**
   * Get card brand icon
   */
  getCardBrandIcon: (brand) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      diners: '💳',
      jcb: '💳',
      unionpay: '💳'
    };
    return icons[brand?.toLowerCase()] || '💳';
  },

  /**
   * Format card display
   */
  formatCardDisplay: (last4, brand = 'card') => {
    const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `${brandName} •••• ${last4}`;
  },

  /**
   * Validate payment intent status
   */
  isPaymentSuccessful: (status) => {
    return status === 'succeeded';
  },

  /**
   * Check if subscription is active
   */
  isSubscriptionActive: (status) => {
    return ['active', 'trialing'].includes(status);
  },

  /**
   * Check if payment method is required
   */
  isPaymentMethodRequired: (planType) => {
    return planType !== 'trial';
  },

  /**
   * Track upgrade event
   */
  trackUpgrade: (planType, amount) => {
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: `upgrade_${Date.now()}`,
        value: amount,
        currency: 'GBP',
        items: [{
          item_name: billingService.getPlanDisplayName(planType),
          item_category: 'subscription',
          price: amount,
          quantity: 1
        }]
      });
    }

    if (window.fbq) {
      window.fbq('track', 'Subscribe', {
        value: amount,
        currency: 'GBP',
        predicted_ltv: planType === 'pro_yearly' ? 260 : 312
      });
    }
  },

  /**
   * Track cancellation event
   */
  trackCancellation: (reason) => {
    if (window.gtag) {
      window.gtag('event', 'cancel_subscription', {
        reason: reason || 'not_specified'
      });
    }

    if (window.fbq) {
      window.fbq('track', 'CancelSubscription', {
        reason: reason || 'not_specified'
      });
    }
  },

  /**
   * Get available plans
   */
  getAvailablePlans: () => {
    return [
      {
        id: 'trial',
        name: '7-Day Free Trial',
        price: 0,
        interval: 'trial',
        features: [
          'Access to all 40+ tools',
          'SUPERNova AI assistant',
          'Basic support',
          '7-day trial period'
        ],
        cta: 'Start Free Trial',
        popular: false
      },
      {
        id: 'pro_monthly',
        name: 'PRO Monthly',
        price: 26,
        interval: 'month',
        features: [
          'Everything in Trial',
          'Unlimited projects',
          'Priority support',
          'No watermarks',
          'Custom domain',
          'Advanced analytics'
        ],
        cta: 'Upgrade to PRO',
        popular: true
      },
      {
        id: 'pro_yearly',
        name: 'PRO Yearly',
        price: 260,
        interval: 'year',
        monthlyEquivalent: 21.67,
        features: [
          'Everything in PRO Monthly',
          'Save £52/year',
          '2 months free',
          'Priority support',
          'Early access to new features'
        ],
        cta: 'Save 17%',
        popular: false,
        savings: billingService.getPlanSavings('pro_yearly')
      },
      {
        id: 'supernova_lte',
        name: 'SUPERNova LTE',
        price: 999,
        interval: 'lifetime',
        features: [
          'Everything in PRO',
          'Lifetime access',
          'One-time payment',
          'All future updates',
          'VIP support',
          'Exclusive features'
        ],
        cta: 'Get Lifetime Access',
        popular: false,
        badge: 'BEST VALUE'
      }
    ];
  },

  /**
   * Get cancellation reasons
   */
  getCancellationReasons: () => {
    return [
      { value: 'too_expensive', label: 'Too expensive' },
      { value: 'missing_features', label: 'Missing features I need' },
      { value: 'too_complicated', label: 'Too complicated to use' },
      { value: 'not_using', label: 'Not using it enough' },
      { value: 'found_alternative', label: 'Found a better alternative' },
      { value: 'technical_issues', label: 'Technical issues' },
      { value: 'temporary', label: 'Temporary - planning to come back' },
      { value: 'other', label: 'Other reason' }
    ];
  }
};

export default billingService;
