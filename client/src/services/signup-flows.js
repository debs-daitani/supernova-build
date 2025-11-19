/**
 * Phase 2BB: Signup Flow Builder
 * Frontend Service - API client for signup flows
 */

import api from './api';

const signupFlowsService = {
  // ============================================
  // FLOW MANAGEMENT
  // ============================================

  /**
   * Get all signup flows
   */
  getAllFlows: async () => {
    const response = await api.get('/signup-flows');
    return response.data;
  },

  /**
   * Get single flow
   */
  getFlow: async (id) => {
    const response = await api.get(`/signup-flows/${id}`);
    return response.data;
  },

  /**
   * Create flow
   */
  createFlow: async (data) => {
    const response = await api.post('/signup-flows', data);
    return response.data;
  },

  /**
   * Update flow
   */
  updateFlow: async (id, data) => {
    const response = await api.patch(`/signup-flows/${id}`, data);
    return response.data;
  },

  /**
   * Delete flow
   */
  deleteFlow: async (id) => {
    const response = await api.delete(`/signup-flows/${id}`);
    return response.data;
  },

  /**
   * Publish flow
   */
  publishFlow: async (id) => {
    const response = await api.post(`/signup-flows/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublish flow
   */
  unpublishFlow: async (id) => {
    const response = await api.post(`/signup-flows/${id}/unpublish`);
    return response.data;
  },

  /**
   * Duplicate flow
   */
  duplicateFlow: async (id) => {
    const response = await api.post(`/signup-flows/${id}/duplicate`);
    return response.data;
  },

  // ============================================
  // PUBLIC PAGES
  // ============================================

  /**
   * Get public flow by slug
   */
  getPublicFlow: async (slug) => {
    const response = await api.get(`/signup-flows/public/${slug}`);
    return response.data;
  },

  // ============================================
  // SUBMISSIONS
  // ============================================

  /**
   * Start submission
   */
  startSubmission: async (flowId, data) => {
    const response = await api.post(`/signup-flows/${flowId}/start`, data);
    return response.data;
  },

  /**
   * Save step
   */
  saveStep: async (submissionId, data) => {
    const response = await api.patch(`/signup-flows/submissions/${submissionId}`, data);
    return response.data;
  },

  /**
   * Complete submission
   */
  completeSubmission: async (submissionId) => {
    const response = await api.post(`/signup-flows/submissions/${submissionId}/complete`);
    return response.data;
  },

  /**
   * Get submissions
   */
  getSubmissions: async (flowId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/signup-flows/${flowId}/submissions${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  /**
   * Get submission detail
   */
  getSubmissionDetail: async (submissionId) => {
    const response = await api.get(`/signup-flows/submissions/${submissionId}/detail`);
    return response.data;
  },

  /**
   * Export submissions
   */
  exportSubmissions: async (flowId) => {
    const response = await api.post(`/signup-flows/${flowId}/export`, {}, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get analytics
   */
  getAnalytics: async (flowId) => {
    const response = await api.get(`/signup-flows/${flowId}/analytics`);
    return response.data;
  },

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * Get all templates
   */
  getTemplates: async () => {
    const response = await api.get('/signup-flows/templates/all');
    return response.data;
  },

  /**
   * Get pre-built template configs
   */
  getTemplateConfig: (type) => {
    const templates = {
      lead_magnet: {
        name: 'Lead Magnet - Free Guide',
        flowType: 'lead_magnet',
        steps: [
          {
            title: 'Get Your Free Guide',
            fields: [
              {
                id: 'name',
                type: 'text',
                label: 'Your Name',
                placeholder: 'Enter your name',
                required: true
              },
              {
                id: 'email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'you@example.com',
                required: true
              }
            ],
            buttonText: 'Send Me The Guide'
          }
        ],
        confirmationMessage: '🎉 Check your email! Your free guide is on its way.',
        leadMagnetName: 'Free Guide'
      },

      waitlist: {
        name: 'Waitlist - Product Launch',
        flowType: 'waitlist',
        steps: [
          {
            title: 'Join The Waitlist',
            description: 'Be the first to know when we launch',
            fields: [
              {
                id: 'name',
                type: 'text',
                label: 'Your Name',
                required: true
              },
              {
                id: 'email',
                type: 'email',
                label: 'Email Address',
                required: true
              }
            ],
            buttonText: 'Join Waitlist'
          }
        ],
        confirmationMessage: '🎉 You\'re on the list! We\'ll notify you when we launch.'
      },

      trial: {
        name: 'Free Trial Signup',
        flowType: 'trial',
        steps: [
          {
            title: 'Start Your Free 7-Day Trial',
            description: 'No credit card required',
            fields: [
              {
                id: 'name',
                type: 'text',
                label: 'Your Name',
                required: true
              },
              {
                id: 'email',
                type: 'email',
                label: 'Email Address',
                required: true
              },
              {
                id: 'password',
                type: 'password',
                label: 'Create Password',
                required: true
              }
            ],
            buttonText: 'Continue'
          },
          {
            title: 'About Your Business',
            fields: [
              {
                id: 'company',
                type: 'text',
                label: 'Company Name',
                required: true
              },
              {
                id: 'industry',
                type: 'select',
                label: 'Industry',
                options: ['E-commerce', 'SaaS', 'Consulting', 'Other'],
                required: true
              }
            ],
            buttonText: 'Start Trial'
          }
        ],
        confirmationMessage: 'Welcome aboard! 🚀 Your trial is now active.'
      },

      newsletter: {
        name: 'Newsletter Signup',
        flowType: 'newsletter',
        steps: [
          {
            title: 'Subscribe to Our Newsletter',
            description: 'Get weekly tips in your inbox',
            fields: [
              {
                id: 'email',
                type: 'email',
                label: 'Your Email',
                placeholder: 'you@example.com',
                required: true
              }
            ],
            buttonText: 'Subscribe'
          }
        ],
        confirmationMessage: 'Thanks for subscribing! Check your email to confirm.'
      },

      event: {
        name: 'Event Registration',
        flowType: 'event',
        steps: [
          {
            title: 'Register for Webinar',
            description: 'Free Masterclass - January 15, 7pm GMT',
            fields: [
              {
                id: 'name',
                type: 'text',
                label: 'Your Name',
                required: true
              },
              {
                id: 'email',
                type: 'email',
                label: 'Email Address',
                required: true
              },
              {
                id: 'phone',
                type: 'tel',
                label: 'Phone Number (optional)'
              }
            ],
            buttonText: 'Save My Seat'
          }
        ],
        confirmationMessage: 'You\'re registered! 📅 We\'ll send you the Zoom link via email.'
      }
    };

    return templates[type] || templates.lead_magnet;
  },

  /**
   * Get available flow types
   */
  getFlowTypes: () => {
    return [
      {
        type: 'lead_magnet',
        name: 'Lead Magnet',
        description: 'Free ebook, guide, or resource download',
        icon: '📚'
      },
      {
        type: 'waitlist',
        name: 'Waitlist',
        description: 'Pre-launch product waitlist',
        icon: '📝'
      },
      {
        type: 'trial',
        name: 'Free Trial',
        description: 'SaaS or service trial signup',
        icon: '🚀'
      },
      {
        type: 'newsletter',
        name: 'Newsletter',
        description: 'Email list subscription',
        icon: '📧'
      },
      {
        type: 'event',
        name: 'Event Registration',
        description: 'Webinar or workshop signup',
        icon: '📹'
      },
      {
        type: 'quiz',
        name: 'Quiz/Assessment',
        description: 'Interactive quiz with results',
        icon: '❓'
      }
    ];
  },

  /**
   * Get available field types
   */
  getFieldTypes: () => {
    return [
      { type: 'text', label: 'Text Input', icon: '📝' },
      { type: 'email', label: 'Email', icon: '📧' },
      { type: 'tel', label: 'Phone', icon: '📞' },
      { type: 'textarea', label: 'Long Text', icon: '📄' },
      { type: 'select', label: 'Dropdown', icon: '▼' },
      { type: 'radio', label: 'Radio Buttons', icon: '◉' },
      { type: 'checkbox', label: 'Checkboxes', icon: '☑' },
      { type: 'password', label: 'Password', icon: '🔒' },
      { type: 'url', label: 'Website URL', icon: '🔗' },
      { type: 'number', label: 'Number', icon: '#' }
    ];
  }
};

export default signupFlowsService;
