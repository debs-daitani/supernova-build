import api from './api';

const onboardingService = {
  // ============================================
  // USER ENDPOINTS - Progress
  // ============================================

  // Get user's onboarding progress
  getProgress: async () => {
    const response = await api.get('/onboarding/progress');
    return response.data;
  },

  // Update onboarding progress
  updateProgress: async (data) => {
    const response = await api.post('/onboarding/progress', data);
    return response.data;
  },

  // Complete a step
  completeStep: async (stepId, milestone = null) => {
    const response = await api.post('/onboarding/complete-step', { stepId, milestone });
    return response.data;
  },

  // Reset onboarding
  reset: async () => {
    const response = await api.post('/onboarding/reset');
    return response.data;
  },

  // ============================================
  // USER ENDPOINTS - Steps
  // ============================================

  // Get onboarding steps
  getSteps: async (goal = null) => {
    const params = goal ? `?goal=${goal}` : '';
    const response = await api.get(`/onboarding/steps${params}`);
    return response.data;
  },

  // Get a specific step
  getStep: async (stepId) => {
    const response = await api.get(`/onboarding/steps/${stepId}`);
    return response.data;
  },

  // ============================================
  // USER ENDPOINTS - Quick Wins
  // ============================================

  // Get quick wins for user
  getQuickWins: async () => {
    const response = await api.get('/onboarding/quick-wins');
    return response.data;
  },

  // Complete a quick win
  completeQuickWin: async (quickWinId) => {
    const response = await api.post(`/onboarding/quick-wins/${quickWinId}/complete`);
    return response.data;
  },

  // ============================================
  // USER ENDPOINTS - Tutorials
  // ============================================

  // Get tutorials with progress
  getTutorials: async (category = null) => {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/onboarding/tutorials${params}`);
    return response.data;
  },

  // Update tutorial progress
  updateTutorialProgress: async (tutorialId, data) => {
    const response = await api.post(`/onboarding/tutorials/${tutorialId}/progress`, data);
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS - Steps
  // ============================================

  // Get all steps (admin)
  adminGetSteps: async () => {
    const response = await api.get('/onboarding/admin/steps');
    return response.data;
  },

  // Create step (admin)
  adminCreateStep: async (stepData) => {
    const response = await api.post('/onboarding/admin/steps', stepData);
    return response.data;
  },

  // Update step (admin)
  adminUpdateStep: async (id, stepData) => {
    const response = await api.patch(`/onboarding/admin/steps/${id}`, stepData);
    return response.data;
  },

  // Delete step (admin)
  adminDeleteStep: async (id) => {
    const response = await api.delete(`/onboarding/admin/steps/${id}`);
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS - Quick Wins
  // ============================================

  // Get all quick wins (admin)
  adminGetQuickWins: async () => {
    const response = await api.get('/onboarding/admin/quick-wins');
    return response.data;
  },

  // Create quick win (admin)
  adminCreateQuickWin: async (quickWinData) => {
    const response = await api.post('/onboarding/admin/quick-wins', quickWinData);
    return response.data;
  },

  // Update quick win (admin)
  adminUpdateQuickWin: async (id, quickWinData) => {
    const response = await api.patch(`/onboarding/admin/quick-wins/${id}`, quickWinData);
    return response.data;
  },

  // Delete quick win (admin)
  adminDeleteQuickWin: async (id) => {
    const response = await api.delete(`/onboarding/admin/quick-wins/${id}`);
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS - Analytics
  // ============================================

  // Get onboarding analytics
  getAnalytics: async () => {
    const response = await api.get('/onboarding/admin/analytics');
    return response.data;
  }
};

export default onboardingService;
