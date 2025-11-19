/**
 * Phase 2BA: Landing Page System
 * Frontend Service - API client for landing pages
 */

import api from './api';

const landingPagesService = {
  // ============================================
  // PAGE MANAGEMENT
  // ============================================

  /**
   * Get all landing pages
   */
  getAllPages: async () => {
    const response = await api.get('/landing-pages');
    return response.data;
  },

  /**
   * Get single landing page
   */
  getPage: async (id) => {
    const response = await api.get(`/landing-pages/${id}`);
    return response.data;
  },

  /**
   * Create landing page
   */
  createPage: async (data) => {
    const response = await api.post('/landing-pages', data);
    return response.data;
  },

  /**
   * Update landing page
   */
  updatePage: async (id, data) => {
    const response = await api.patch(`/landing-pages/${id}`, data);
    return response.data;
  },

  /**
   * Delete landing page
   */
  deletePage: async (id) => {
    const response = await api.delete(`/landing-pages/${id}`);
    return response.data;
  },

  /**
   * Publish landing page
   */
  publishPage: async (id) => {
    const response = await api.post(`/landing-pages/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublish landing page
   */
  unpublishPage: async (id) => {
    const response = await api.post(`/landing-pages/${id}/unpublish`);
    return response.data;
  },

  /**
   * Duplicate landing page
   */
  duplicatePage: async (id) => {
    const response = await api.post(`/landing-pages/${id}/duplicate`);
    return response.data;
  },

  // ============================================
  // A/B TESTING
  // ============================================

  /**
   * Create A/B test variant
   */
  createVariant: async (id, trafficSplit) => {
    const response = await api.post(`/landing-pages/${id}/variants`, { trafficSplit });
    return response.data;
  },

  /**
   * Get A/B test results
   */
  getTestResults: async (id) => {
    const response = await api.get(`/landing-pages/${id}/test-results`);
    return response.data;
  },

  // ============================================
  // PUBLIC PAGES
  // ============================================

  /**
   * Get public landing page by slug
   */
  getPublicPage: async (slug) => {
    const response = await api.get(`/landing-pages/public/${slug}`);
    return response.data;
  },

  // ============================================
  // TRACKING
  // ============================================

  /**
   * Track page view
   */
  trackView: async (pageId, data) => {
    const response = await api.post(`/landing-pages/${pageId}/view`, data);
    return response.data;
  },

  /**
   * Track time on page
   */
  trackTime: async (pageId, data) => {
    const response = await api.post(`/landing-pages/${pageId}/time`, data);
    return response.data;
  },

  /**
   * Track conversion
   */
  trackConversion: async (pageId, data) => {
    const response = await api.post(`/landing-pages/${pageId}/convert`, data);
    return response.data;
  },

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get landing page analytics
   */
  getAnalytics: async (id) => {
    const response = await api.get(`/landing-pages/${id}/analytics`);
    return response.data;
  },

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * Get all templates
   */
  getTemplates: async () => {
    const response = await api.get('/landing-pages/templates/all');
    return response.data;
  },

  /**
   * Create template (admin)
   */
  createTemplate: async (data) => {
    const response = await api.post('/landing-pages/templates', data);
    return response.data;
  },

  // ============================================
  // PRE-BUILT TEMPLATE CONFIGS
  // ============================================

  /**
   * Get template configuration by type
   */
  getTemplateConfig: (type) => {
    const templates = {
      sales: {
        name: 'Classic Sales Page',
        category: 'sales',
        description: 'Long-form conversion-optimized sales page',
        sections: [
          {
            type: 'hero',
            style: 'classic',
            content: {
              headline: 'Replace 40+ Tools. Pay £26/Month.',
              subheadline: 'Stop juggling subscriptions. Get website builder, CRM, ecommerce, and 40+ features in one platform.',
              ctaText: 'Start Free Trial',
              ctaUrl: '/signup',
              image: '/images/hero-dashboard.png'
            }
          },
          {
            type: 'socialProof',
            style: 'logos',
            content: {
              title: 'Trusted by 500+ Entrepreneurs',
              logos: [
                { name: 'Forbes', url: '/images/forbes.png' },
                { name: 'TechCrunch', url: '/images/techcrunch.png' },
                { name: 'Inc', url: '/images/inc.png' }
              ]
            }
          },
          {
            type: 'problem',
            content: {
              headline: 'Paying £600+/Month for Separate Tools?',
              description: 'Most entrepreneurs juggle 40+ subscriptions. There\'s a better way.',
              points: [
                'Wix (£30/mo) - Website',
                'Shopify (£29/mo) - Ecommerce',
                'Salesforce (£25/mo) - CRM',
                'Mailchimp (£20/mo) - Email'
              ]
            }
          },
          {
            type: 'solution',
            content: {
              headline: 'One Platform. Everything You Need.',
              features: [
                { icon: '🌐', title: 'Website Builder', description: 'Drag-drop site creation' },
                { icon: '🛒', title: 'Online Store', description: 'Sell products & services' },
                { icon: '📊', title: 'CRM & Sales', description: 'Manage customers' },
                { icon: '📧', title: 'Email Marketing', description: 'Automated campaigns' }
              ]
            }
          },
          {
            type: 'pricing',
            style: 'sideBySide',
            content: {
              plans: [
                {
                  name: 'FREE',
                  price: '0',
                  period: 'forever',
                  features: ['Try all features', '7-day trial', 'No credit card'],
                  ctaText: 'Start Free',
                  ctaUrl: '/signup'
                },
                {
                  name: 'PRO',
                  price: '26',
                  period: 'month',
                  popular: true,
                  features: ['Unlimited everything', '40+ tools', 'Priority support'],
                  ctaText: 'Start Trial',
                  ctaUrl: '/signup?plan=pro'
                },
                {
                  name: 'ENTERPRISE',
                  price: 'Custom',
                  features: ['White-label', 'Dedicated support', 'Custom features'],
                  ctaText: 'Contact Us',
                  ctaUrl: '/contact'
                }
              ]
            }
          },
          {
            type: 'testimonials',
            style: 'grid',
            content: {
              testimonials: [
                {
                  quote: 'This platform saved me £658/month. Game changer!',
                  name: 'Sarah Mitchell',
                  role: 'Online Coach',
                  avatar: '/images/testimonial-1.jpg',
                  rating: 5
                },
                {
                  quote: 'Everything I need in one place. Love it!',
                  name: 'Emma Thompson',
                  role: 'Course Creator',
                  avatar: '/images/testimonial-2.jpg',
                  rating: 5
                }
              ]
            }
          },
          {
            type: 'faq',
            content: {
              headline: 'Frequently Asked Questions',
              faqs: [
                {
                  question: 'Can I cancel anytime?',
                  answer: 'Yes! Cancel anytime with one click. No questions asked.'
                },
                {
                  question: 'Do you offer refunds?',
                  answer: '30-day money-back guarantee. If you\'re not happy, we refund 100%.'
                },
                {
                  question: 'What if I\'m not technical?',
                  answer: 'Perfect! Our platform is designed for non-tech entrepreneurs. Everything is drag-and-drop.'
                }
              ]
            }
          },
          {
            type: 'finalCTA',
            content: {
              headline: 'Ready to Save £658/Month?',
              ctaText: 'Start Your Free Trial',
              ctaUrl: '/signup',
              subtext: 'No credit card required. Cancel anytime.'
            }
          }
        ]
      },

      product: {
        name: 'Product Launch Page',
        category: 'product',
        description: 'Single product focus with countdown timer',
        sections: [
          {
            type: 'hero',
            style: 'center',
            content: {
              headline: 'The All-In-One Platform You\'ve Been Waiting For',
              subheadline: 'Launching in 3 days. Get early access.',
              ctaText: 'Join Waitlist',
              ctaUrl: '/waitlist',
              countdown: {
                endDate: '2025-12-31T23:59:59'
              }
            }
          },
          {
            type: 'features',
            content: {
              headline: 'What\'s Included',
              features: [
                { icon: '⚡', title: 'Lightning Fast', description: 'Built for speed' },
                { icon: '🔒', title: 'Secure', description: 'Bank-level encryption' },
                { icon: '📱', title: 'Mobile First', description: 'Perfect on any device' }
              ]
            }
          },
          {
            type: 'pricing',
            style: 'launch',
            content: {
              headline: 'Launch Special: 50% Off',
              originalPrice: '52',
              launchPrice: '26',
              period: 'month',
              ctaText: 'Claim Discount',
              ctaUrl: '/signup?promo=launch50'
            }
          }
        ]
      },

      webinar: {
        name: 'Webinar Registration',
        category: 'webinar',
        description: 'Event registration with speaker bio',
        sections: [
          {
            type: 'hero',
            style: 'webinar',
            content: {
              headline: 'Free Masterclass: Build Your Business with AI',
              date: 'Tuesday, January 15th at 7pm GMT',
              ctaText: 'Save My Seat',
              ctaUrl: '/register'
            }
          },
          {
            type: 'whatYouLearn',
            content: {
              headline: 'What You\'ll Learn',
              points: [
                'How to replace 40+ tools with one platform',
                'The exact strategy I used to save £658/month',
                'Live Q&A with Debs'
              ]
            }
          },
          {
            type: 'speaker',
            content: {
              name: 'Debs Daitani',
              bio: 'Founder of The dAItaniverse, helping female entrepreneurs build profitable businesses.',
              photo: '/images/debs.jpg'
            }
          }
        ]
      },

      waitlist: {
        name: 'Waitlist Page',
        category: 'waitlist',
        description: 'Pre-launch email capture',
        sections: [
          {
            type: 'hero',
            style: 'center',
            content: {
              headline: 'Coming Soon: The Future of Business Tools',
              subheadline: 'Join 1,000+ entrepreneurs on the waitlist',
              ctaText: 'Join Waitlist',
              ctaUrl: '#form'
            }
          },
          {
            type: 'form',
            content: {
              fields: [
                { type: 'email', placeholder: 'Enter your email', required: true },
                { type: 'text', placeholder: 'Your name', required: true }
              ],
              submitText: 'Notify Me',
              successMessage: 'You\'re on the list! Check your email.'
            }
          },
          {
            type: 'earlyBird',
            content: {
              headline: 'Early Bird Benefits',
              benefits: [
                'Lifetime 50% discount',
                'Priority support',
                'Exclusive training'
              ]
            }
          }
        ]
      }
    };

    return templates[type] || templates.sales;
  },

  /**
   * Get all available template types
   */
  getTemplateTypes: () => {
    return [
      {
        type: 'sales',
        name: 'Classic Sales Page',
        description: 'Long-form conversion-optimized sales page',
        thumbnail: '/images/templates/sales.png'
      },
      {
        type: 'product',
        name: 'Product Launch',
        description: 'Single product focus with countdown timer',
        thumbnail: '/images/templates/product.png'
      },
      {
        type: 'webinar',
        name: 'Webinar Registration',
        description: 'Event registration with speaker bio',
        thumbnail: '/images/templates/webinar.png'
      },
      {
        type: 'waitlist',
        name: 'Waitlist Page',
        description: 'Pre-launch email capture',
        thumbnail: '/images/templates/waitlist.png'
      }
    ];
  },

  /**
   * Get section component by type
   */
  getSectionTypes: () => {
    return [
      {
        type: 'hero',
        name: 'Hero Section',
        icon: '🎯',
        styles: ['classic', 'center', 'split', 'video']
      },
      {
        type: 'socialProof',
        name: 'Social Proof',
        icon: '⭐',
        styles: ['logos', 'testimonials', 'stats']
      },
      {
        type: 'features',
        name: 'Features Grid',
        icon: '✨',
        styles: ['grid', 'list']
      },
      {
        type: 'pricing',
        name: 'Pricing Table',
        icon: '💰',
        styles: ['sideBySide', 'toggle', 'tiered']
      },
      {
        type: 'testimonials',
        name: 'Testimonials',
        icon: '💬',
        styles: ['single', 'grid', 'carousel']
      },
      {
        type: 'faq',
        name: 'FAQ Section',
        icon: '❓',
        styles: ['accordion']
      },
      {
        type: 'cta',
        name: 'Call to Action',
        icon: '🎯',
        styles: ['basic', 'box', 'fullWidth']
      },
      {
        type: 'form',
        name: 'Form',
        icon: '📝',
        styles: ['inline', 'box']
      }
    ];
  }
};

export default landingPagesService;
