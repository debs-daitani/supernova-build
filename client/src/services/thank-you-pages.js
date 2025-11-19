/**
 * Phase 2BD: Thank You Pages
 * Frontend Service - API client for thank you pages
 */

import api from './api';

const thankYouPagesService = {
  // ============================================
  // THANK YOU PAGES
  // ============================================

  /**
   * Get all thank you pages
   */
  getAllPages: async () => {
    const response = await api.get('/thank-you-pages');
    return response.data;
  },

  /**
   * Get single thank you page
   */
  getPage: async (id) => {
    const response = await api.get(`/thank-you-pages/${id}`);
    return response.data;
  },

  /**
   * Create thank you page
   */
  createPage: async (data) => {
    const response = await api.post('/thank-you-pages', data);
    return response.data;
  },

  /**
   * Update thank you page
   */
  updatePage: async (id, data) => {
    const response = await api.patch(`/thank-you-pages/${id}`, data);
    return response.data;
  },

  /**
   * Delete thank you page
   */
  deletePage: async (id) => {
    const response = await api.delete(`/thank-you-pages/${id}`);
    return response.data;
  },

  /**
   * Publish thank you page
   */
  publishPage: async (id) => {
    const response = await api.post(`/thank-you-pages/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublish thank you page
   */
  unpublishPage: async (id) => {
    const response = await api.post(`/thank-you-pages/${id}/unpublish`);
    return response.data;
  },

  // ============================================
  // PUBLIC THANK YOU PAGE
  // ============================================

  /**
   * Get public thank you page by slug
   */
  getPublicPage: async (slug, orderId) => {
    const response = await api.get(`/thank-you-pages/public/${slug}?orderId=${orderId}`);
    return response.data;
  },

  /**
   * Accept upsell
   */
  acceptUpsell: async (pageId, data) => {
    const response = await api.post(`/thank-you-pages/${pageId}/upsell-accept`, data);
    return response.data;
  },

  /**
   * Accept downsell
   */
  acceptDownsell: async (pageId, data) => {
    const response = await api.post(`/thank-you-pages/${pageId}/downsell-accept`, data);
    return response.data;
  },

  /**
   * Track social share
   */
  trackShare: async (pageId, data) => {
    const response = await api.post(`/thank-you-pages/${pageId}/share`, data);
    return response.data;
  },

  /**
   * Submit survey
   */
  submitSurvey: async (pageId, data) => {
    const response = await api.post(`/thank-you-pages/${pageId}/survey`, data);
    return response.data;
  },

  /**
   * Track calendar booking
   */
  trackCalendarBooking: async (pageId, data) => {
    const response = await api.post(`/thank-you-pages/${pageId}/calendar-booked`, data);
    return response.data;
  },

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get analytics
   */
  getAnalytics: async (id) => {
    const response = await api.get(`/thank-you-pages/${id}/analytics`);
    return response.data;
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Get section types
   */
  getSectionTypes: () => {
    return [
      {
        type: 'orderConfirmation',
        name: 'Order Confirmation',
        icon: '✅',
        description: 'Display order details and receipt'
      },
      {
        type: 'celebration',
        name: 'Celebration Hero',
        icon: '🎉',
        description: 'Big, exciting welcome message'
      },
      {
        type: 'upsell',
        name: 'Upsell Offer',
        icon: '💰',
        description: 'One-click additional purchase'
      },
      {
        type: 'nextSteps',
        name: 'Next Steps Guide',
        icon: '📋',
        description: 'Onboarding checklist'
      },
      {
        type: 'socialShare',
        name: 'Social Share',
        icon: '📢',
        description: 'Encourage sharing with friends'
      },
      {
        type: 'community',
        name: 'Community Join',
        icon: '👥',
        description: 'Invite to Facebook group or Discord'
      },
      {
        type: 'calendar',
        name: 'Calendar Booking',
        icon: '📅',
        description: 'Schedule onboarding call'
      },
      {
        type: 'survey',
        name: 'Survey/Feedback',
        icon: '📝',
        description: 'Collect testimonials and feedback'
      }
    ];
  },

  /**
   * Get default thank you page template
   */
  getDefaultTemplate: (type = 'course') => {
    const templates = {
      course: {
        name: 'Course Purchase Thank You',
        theme: 'celebration',
        sections: [
          {
            type: 'celebration',
            content: {
              headline: '🎓 You\'re In!',
              subheadline: 'Welcome to the course. Let\'s get started!',
              showConfetti: true
            }
          },
          {
            type: 'orderConfirmation',
            content: {
              showReceipt: true,
              showEmail: true
            }
          },
          {
            type: 'nextSteps',
            content: {
              steps: [
                {
                  icon: '📧',
                  title: 'Check Your Email',
                  description: 'We just sent your login details',
                  actionText: null
                },
                {
                  icon: '🎓',
                  title: 'Access Course',
                  description: 'Start with Module 1',
                  actionText: 'Go to Course',
                  actionUrl: '/courses'
                },
                {
                  icon: '💬',
                  title: 'Join Community',
                  description: 'Connect with other students',
                  actionText: 'Join Now',
                  actionUrl: '/community'
                }
              ]
            }
          }
        ],
        showNextSteps: true,
        nextSteps: [],
        enableSharing: true,
        shareMessage: 'I just enrolled in this amazing course! Check it out:',
        showCommunityJoin: false
      },
      product: {
        name: 'Product Purchase Thank You',
        theme: 'celebration',
        sections: [
          {
            type: 'celebration',
            content: {
              headline: '🎉 Order Confirmed!',
              subheadline: 'Thanks for your order!',
              showConfetti: true
            }
          },
          {
            type: 'orderConfirmation',
            content: {
              showReceipt: true,
              showShipping: true
            }
          },
          {
            type: 'nextSteps',
            content: {
              steps: [
                {
                  icon: '📧',
                  title: 'Confirmation Email',
                  description: 'Check your inbox for order details'
                },
                {
                  icon: '📦',
                  title: 'Processing',
                  description: 'Your order is being processed'
                },
                {
                  icon: '🚚',
                  title: 'Shipping',
                  description: 'Delivery in 3-5 business days'
                }
              ]
            }
          },
          {
            type: 'socialShare',
            content: {
              platforms: ['facebook', 'twitter', 'email'],
              incentive: 'Share and get 10% off your next order!'
            }
          }
        ],
        showNextSteps: true,
        enableSharing: true,
        shareMessage: 'Just got this awesome product! You should check it out:'
      },
      service: {
        name: 'Service Purchase Thank You',
        theme: 'celebration',
        sections: [
          {
            type: 'celebration',
            content: {
              headline: '💪 Let\'s Do This!',
              subheadline: 'You just booked your service',
              showConfetti: true
            }
          },
          {
            type: 'orderConfirmation',
            content: {
              showReceipt: true
            }
          },
          {
            type: 'calendar',
            content: {
              headline: 'Schedule Your Onboarding Call',
              description: '30-minute call to get you started'
            }
          },
          {
            type: 'nextSteps',
            content: {
              steps: [
                {
                  icon: '📅',
                  title: 'Book Your Call',
                  description: 'Schedule your onboarding session'
                },
                {
                  icon: '📧',
                  title: 'Check Email',
                  description: 'We sent you all the details'
                },
                {
                  icon: '🚀',
                  title: 'Get Started',
                  description: 'We\'ll begin within 24 hours'
                }
              ]
            }
          }
        ],
        enableCalendar: true,
        calendlyUrl: '',
        showNextSteps: true
      }
    };

    return templates[type] || templates.course;
  },

  /**
   * Get survey question templates
   */
  getSurveyTemplates: () => {
    return [
      {
        id: 'decision',
        type: 'radio',
        question: 'What made you decide to purchase today?',
        options: ['Price', 'Features', 'Reviews', 'Recommendation', 'Other']
      },
      {
        id: 'challenge',
        type: 'textarea',
        question: 'What\'s your biggest challenge right now?'
      },
      {
        id: 'testimonial',
        type: 'radio',
        question: 'Can we use your feedback as a testimonial?',
        options: ['Yes, absolutely!', 'No thanks']
      },
      {
        id: 'expectations',
        type: 'textarea',
        question: 'What are you hoping to achieve with this purchase?'
      },
      {
        id: 'referral',
        type: 'text',
        question: 'How did you hear about us?'
      }
    ];
  },

  /**
   * Generate share URL
   */
  generateShareUrl: (platform, message, url) => {
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(url);

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=Check this out&body=${encodedMessage} ${encodedUrl}`
    };

    return urls[platform] || urls.facebook;
  }
};

export default thankYouPagesService;
