/**
 * Phase 2BC: Checkout Pages
 * Frontend Service - API client for checkout, orders, coupons
 */

import api from './api';

const checkoutService = {
  // ============================================
  // CHECKOUT PAGES
  // ============================================

  /**
   * Get all checkout pages
   */
  getAllPages: async () => {
    const response = await api.get('/checkout/pages');
    return response.data;
  },

  /**
   * Get single checkout page
   */
  getPage: async (id) => {
    const response = await api.get(`/checkout/pages/${id}`);
    return response.data;
  },

  /**
   * Create checkout page
   */
  createPage: async (data) => {
    const response = await api.post('/checkout/pages', data);
    return response.data;
  },

  /**
   * Update checkout page
   */
  updatePage: async (id, data) => {
    const response = await api.patch(`/checkout/pages/${id}`, data);
    return response.data;
  },

  /**
   * Delete checkout page
   */
  deletePage: async (id) => {
    const response = await api.delete(`/checkout/pages/${id}`);
    return response.data;
  },

  /**
   * Publish checkout page
   */
  publishPage: async (id) => {
    const response = await api.post(`/checkout/pages/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublish checkout page
   */
  unpublishPage: async (id) => {
    const response = await api.post(`/checkout/pages/${id}/unpublish`);
    return response.data;
  },

  /**
   * Duplicate checkout page
   */
  duplicatePage: async (id) => {
    const response = await api.post(`/checkout/pages/${id}/duplicate`);
    return response.data;
  },

  // ============================================
  // PUBLIC CHECKOUT
  // ============================================

  /**
   * Get public checkout page by slug
   */
  getPublicPage: async (slug) => {
    const response = await api.get(`/checkout/public/${slug}`);
    return response.data;
  },

  /**
   * Create payment intent
   */
  createPaymentIntent: async (checkoutId, data) => {
    const response = await api.post(`/checkout/${checkoutId}/create-payment-intent`, data);
    return response.data;
  },

  /**
   * Complete order
   */
  completeOrder: async (checkoutId, data) => {
    const response = await api.post(`/checkout/${checkoutId}/complete`, data);
    return response.data;
  },

  // ============================================
  // ORDERS
  // ============================================

  /**
   * Get orders (as seller)
   */
  getOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/checkout/orders${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  /**
   * Get order details
   */
  getOrder: async (id) => {
    const response = await api.get(`/checkout/orders/${id}`);
    return response.data;
  },

  /**
   * Issue refund
   */
  refundOrder: async (id, data) => {
    const response = await api.post(`/checkout/orders/${id}/refund`, data);
    return response.data;
  },

  /**
   * Mark order as fulfilled
   */
  fulfillOrder: async (id, data) => {
    const response = await api.post(`/checkout/orders/${id}/fulfill`, data);
    return response.data;
  },

  // ============================================
  // COUPONS
  // ============================================

  /**
   * Get all coupons
   */
  getAllCoupons: async () => {
    const response = await api.get('/checkout/coupons');
    return response.data;
  },

  /**
   * Create coupon
   */
  createCoupon: async (data) => {
    const response = await api.post('/checkout/coupons', data);
    return response.data;
  },

  /**
   * Update coupon
   */
  updateCoupon: async (id, data) => {
    const response = await api.patch(`/checkout/coupons/${id}`, data);
    return response.data;
  },

  /**
   * Delete coupon
   */
  deleteCoupon: async (id) => {
    const response = await api.delete(`/checkout/coupons/${id}`);
    return response.data;
  },

  /**
   * Validate coupon
   */
  validateCoupon: async (code, subtotal) => {
    const response = await api.post('/checkout/coupons/validate', { code, subtotal });
    return response.data;
  },

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get checkout page analytics
   */
  getAnalytics: async (id) => {
    const response = await api.get(`/checkout/${id}/analytics`);
    return response.data;
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Format currency
   */
  formatCurrency: (amount, currency = 'GBP') => {
    const symbols = {
      GBP: '£',
      USD: '$',
      EUR: '€'
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  },

  /**
   * Calculate discount amount
   */
  calculateDiscount: (subtotal, coupon) => {
    if (!coupon) return 0;

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    return discount;
  },

  /**
   * Get product types
   */
  getProductTypes: () => {
    return [
      { value: 'product', label: 'Physical Product', icon: '📦' },
      { value: 'digital', label: 'Digital Product', icon: '💾' },
      { value: 'course', label: 'Online Course', icon: '📚' },
      { value: 'membership', label: 'Membership', icon: '🎫' },
      { value: 'service', label: 'Service', icon: '⚙️' }
    ];
  },

  /**
   * Get payment methods
   */
  getPaymentMethods: () => {
    return [
      { value: 'stripe', label: 'Credit/Debit Card', icon: '💳' },
      { value: 'paypal', label: 'PayPal', icon: '🅿️' }
    ];
  },

  /**
   * Get order status options
   */
  getOrderStatuses: () => {
    return [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'paid', label: 'Paid', color: 'green' },
      { value: 'failed', label: 'Failed', color: 'red' },
      { value: 'refunded', label: 'Refunded', color: 'gray' }
    ];
  },

  /**
   * Get fulfillment status options
   */
  getFulfillmentStatuses: () => {
    return [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'processing', label: 'Processing', color: 'blue' },
      { value: 'completed', label: 'Completed', color: 'green' }
    ];
  },

  /**
   * Generate sample checkout page data
   */
  getSampleCheckoutPage: (productType = 'product') => {
    const samples = {
      product: {
        name: 'Product Checkout',
        productType: 'product',
        basePrice: 97,
        sections: [
          {
            type: 'header',
            content: {
              logo: '/logo.png',
              showProgress: true
            }
          },
          {
            type: 'product',
            content: {
              image: '/product.jpg',
              name: 'Amazing Product',
              description: 'This product will change your life!',
              price: 97
            }
          },
          {
            type: 'customerInfo',
            content: {
              fields: ['email', 'name', 'phone']
            }
          },
          {
            type: 'payment',
            content: {
              methods: ['stripe', 'paypal']
            }
          }
        ],
        orderBumps: [
          {
            productId: 'bump1',
            price: 27,
            label: 'Add Premium Support for just £27',
            checked: false
          }
        ],
        guaranteeText: '30-Day Money-Back Guarantee',
        showGuarantee: true,
        showSecurity: true
      },
      course: {
        name: 'Course Enrollment',
        productType: 'course',
        basePrice: 197,
        allowPaymentPlan: true,
        paymentPlanConfig: {
          installments: 3,
          interval: 'monthly'
        },
        sections: [
          {
            type: 'header',
            content: {
              headline: 'Enroll Now',
              subheadline: 'Start learning today'
            }
          },
          {
            type: 'courseInfo',
            content: {
              title: 'Master Course',
              modules: 10,
              lessons: 50,
              duration: '20 hours'
            }
          },
          {
            type: 'payment',
            content: {
              options: ['one-time', 'payment-plan']
            }
          }
        ],
        guaranteeText: '30-Day Money-Back Guarantee',
        showTestimonials: true,
        testimonials: [
          {
            quote: 'This course changed my life!',
            name: 'Sarah J.',
            role: 'Student',
            rating: 5
          }
        ]
      },
      membership: {
        name: 'Membership Signup',
        productType: 'membership',
        basePrice: 27,
        allowSubscription: true,
        subscriptionInterval: 'monthly',
        sections: [
          {
            type: 'benefits',
            content: {
              headline: 'Join The Community',
              benefits: [
                'Access to exclusive content',
                'Monthly live Q&A',
                'Private community',
                'Cancel anytime'
              ]
            }
          },
          {
            type: 'payment',
            content: {
              recurring: true,
              interval: 'monthly'
            }
          }
        ]
      }
    };

    return samples[productType] || samples.product;
  }
};

export default checkoutService;
