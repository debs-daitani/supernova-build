/**
 * Phase 2BF: Signup Flow
 * Frontend Service - API client for signup flow
 */

import api from './api';

const signupService = {
  // ============================================
  // SIGNUP FLOW MANAGEMENT
  // ============================================

  /**
   * Start new signup session
   */
  startSignupSession: async (data) => {
    const response = await api.post('/signup/start', data);
    return response.data;
  },

  /**
   * Update signup session progress
   */
  updateSignupSession: async (sessionId, data) => {
    const response = await api.patch(`/signup/session/${sessionId}`, data);
    return response.data;
  },

  /**
   * Get signup session
   */
  getSignupSession: async (sessionId) => {
    const response = await api.get(`/signup/session/${sessionId}`);
    return response.data;
  },

  /**
   * Complete signup - Step 1: Email
   */
  submitEmail: async (data) => {
    const response = await api.post('/signup/step-1-email', data);
    return response.data;
  },

  /**
   * Complete signup - Step 2: Name & Password
   */
  submitCredentials: async (data) => {
    const response = await api.post('/signup/step-2-credentials', data);
    return response.data;
  },

  /**
   * Complete signup - Step 3: Onboarding
   */
  submitOnboarding: async (data) => {
    const response = await api.post('/signup/step-3-onboarding', data);
    return response.data;
  },

  /**
   * Complete signup - Step 4: Plan Selection
   */
  submitPlanSelection: async (data) => {
    const response = await api.post('/signup/step-4-plan', data);
    return response.data;
  },

  /**
   * Complete signup - Step 5: Payment (for paid plans)
   */
  submitPayment: async (data) => {
    const response = await api.post('/signup/step-5-payment', data);
    return response.data;
  },

  /**
   * Complete entire signup flow
   */
  completeSignup: async (data) => {
    const response = await api.post('/signup/complete', data);
    return response.data;
  },

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  /**
   * Verify email with token
   */
  verifyEmail: async (token) => {
    const response = await api.post('/signup/verify-email', { token });
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email) => {
    const response = await api.post('/signup/resend-verification', { email });
    return response.data;
  },

  // ============================================
  // TRIAL MANAGEMENT
  // ============================================

  /**
   * Get trial status
   */
  getTrialStatus: async () => {
    const response = await api.get('/signup/trial-status');
    return response.data;
  },

  /**
   * Upgrade from trial to paid
   */
  upgradeFromTrial: async (data) => {
    const response = await api.post('/signup/upgrade-trial', data);
    return response.data;
  },

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Get goal options for onboarding
   */
  getGoalOptions: () => {
    return [
      { value: 'website', label: 'Build a website', icon: '🌐' },
      { value: 'ecommerce', label: 'Sell products online', icon: '🛒' },
      { value: 'courses', label: 'Create online courses', icon: '🎓' },
      { value: 'crm', label: 'Manage customers (CRM)', icon: '📊' },
      { value: 'social', label: 'Social media management', icon: '📱' },
      { value: 'everything', label: 'Everything!', icon: '🚀' }
    ];
  },

  /**
   * Get industry options
   */
  getIndustryOptions: () => {
    return [
      { value: 'coaching', label: 'Coaching & Consulting' },
      { value: 'ecommerce', label: 'Ecommerce & Retail' },
      { value: 'services', label: 'Professional Services' },
      { value: 'creator', label: 'Content Creator' },
      { value: 'saas', label: 'SaaS & Software' },
      { value: 'agency', label: 'Marketing Agency' },
      { value: 'education', label: 'Online Education' },
      { value: 'health', label: 'Health & Wellness' },
      { value: 'real_estate', label: 'Real Estate' },
      { value: 'other', label: 'Other' }
    ];
  },

  /**
   * Get referral source options
   */
  getReferralOptions: () => {
    return [
      { value: 'google', label: 'Google Search' },
      { value: 'social', label: 'Social Media' },
      { value: 'friend', label: 'Friend or Colleague' },
      { value: 'blog', label: 'Blog or Article' },
      { value: 'ad', label: 'Online Advertisement' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'podcast', label: 'Podcast' },
      { value: 'other', label: 'Other' }
    ];
  },

  /**
   * Format trial countdown
   */
  formatTrialCountdown: (trialEndDate) => {
    const now = new Date();
    const end = new Date(trialEndDate);
    const diff = end - now;

    if (diff <= 0) {
      return { expired: true, message: 'Trial expired', color: 'red' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let message = '';
    let color = 'green';

    if (days > 4) {
      message = `Trial ends in ${days} days`;
      color = 'green';
    } else if (days >= 2) {
      message = `Trial ends in ${days} days, ${hours} hours`;
      color = 'yellow';
    } else if (days === 1) {
      message = `Trial ends in 1 day, ${hours} hours`;
      color = 'orange';
    } else if (hours > 0) {
      message = `Trial ends in ${hours} hours, ${minutes} minutes`;
      color = 'red';
    } else {
      message = `Trial ends in ${minutes} minutes`;
      color = 'red';
    }

    return { expired: false, message, color, days, hours, minutes };
  },

  /**
   * Validate password strength
   */
  validatePassword: (password) => {
    if (!password) {
      return { valid: false, message: 'Password is required', strength: 0 };
    }

    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters', strength: 1 };
    }

    let strength = 1;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['red', 'orange', 'yellow', 'green', 'green'];

    return {
      valid: true,
      strength,
      label: strengthLabels[strength - 1],
      color: strengthColors[strength - 1],
      message: `Password strength: ${strengthLabels[strength - 1]}`
    };
  },

  /**
   * Get session ID from localStorage or create new
   */
  getOrCreateSessionId: () => {
    let sessionId = localStorage.getItem('signup_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('signup_session_id', sessionId);
    }
    return sessionId;
  },

  /**
   * Clear session ID
   */
  clearSessionId: () => {
    localStorage.removeItem('signup_session_id');
  },

  /**
   * Track signup step completion
   */
  trackStepCompletion: (step, data = {}) => {
    // Track with analytics (Google Analytics, Facebook Pixel, etc.)
    if (window.gtag) {
      window.gtag('event', 'signup_step_complete', {
        step_number: step,
        ...data
      });
    }

    if (window.fbq) {
      window.fbq('track', 'SignupStepComplete', {
        step_number: step,
        ...data
      });
    }
  },

  /**
   * Track signup completion
   */
  trackSignupComplete: (userData) => {
    if (window.gtag) {
      window.gtag('event', 'sign_up', {
        method: userData.planType || 'trial'
      });
    }

    if (window.fbq) {
      window.fbq('track', 'CompleteRegistration', {
        value: userData.planType === 'trial' ? 0 : 26,
        currency: 'GBP'
      });
    }
  }
};

export default signupService;
