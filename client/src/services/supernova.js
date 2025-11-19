import api from './api';

const supernovaService = {
  // ============================================
  // CHAT ENDPOINTS
  // ============================================

  // Initialize chat (handles first contact automatically)
  initChat: async () => {
    const response = await api.post('/supernova/chat/init');
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId, message, isFirstContact = false) => {
    const response = await api.post('/supernova/chat', {
      conversationId,
      message,
      isFirstContact
    });
    return response.data;
  },

  // Get user's conversations
  getConversations: async () => {
    const response = await api.get('/supernova/conversations');
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/supernova/conversations/${conversationId}`);
    return response.data;
  },

  // Update user preferences (name/pronouns)
  updatePreferences: async (data) => {
    const response = await api.patch('/supernova/preferences', data);
    return response.data;
  },

  // ============================================
  // KNOWLEDGE BASE ENDPOINTS (Admin)
  // ============================================

  // Upload knowledge base
  uploadKnowledge: async (data) => {
    const response = await api.post('/supernova/knowledge', data);
    return response.data;
  },

  // Get all knowledge versions
  getAllKnowledge: async () => {
    const response = await api.get('/supernova/knowledge');
    return response.data;
  },

  // Get active knowledge base
  getActiveKnowledge: async () => {
    const response = await api.get('/supernova/knowledge/active');
    return response.data;
  },

  // Get specific version
  getKnowledgeVersion: async (version) => {
    const response = await api.get(`/supernova/knowledge/${version}`);
    return response.data;
  },

  // Activate knowledge version
  activateKnowledge: async (id) => {
    const response = await api.patch(`/supernova/knowledge/${id}/activate`);
    return response.data;
  },

  // Delete knowledge version
  deleteKnowledge: async (id) => {
    const response = await api.delete(`/supernova/knowledge/${id}`);
    return response.data;
  },

  // ============================================
  // COACHING MOMENTS ENDPOINTS
  // ============================================

  // Get coaching moments (optionally filtered by trigger)
  getCoachingMoments: async (trigger = null) => {
    const params = trigger ? `?trigger=${trigger}` : '';
    const response = await api.get(`/supernova/coaching-moments${params}`);
    return response.data;
  },

  // Dismiss coaching moment
  dismissCoachingMoment: async (momentId) => {
    const response = await api.post(`/supernova/coaching-moments/${momentId}/dismiss`);
    return response.data;
  },

  // Log coaching moment action taken
  logCoachingAction: async (momentId) => {
    const response = await api.post(`/supernova/coaching-moments/${momentId}/action`);
    return response.data;
  },

  // Create coaching moment (admin)
  createCoachingMoment: async (data) => {
    const response = await api.post('/supernova/coaching-moments', data);
    return response.data;
  },

  // ============================================
  // AI INSIGHTS ENDPOINTS
  // ============================================

  // Get user's AI insights
  getInsights: async () => {
    const response = await api.get('/supernova/insights');
    return response.data;
  },

  // Mark insight as viewed
  markInsightViewed: async (insightId) => {
    const response = await api.post(`/supernova/insights/${insightId}/view`);
    return response.data;
  },

  // Mark insight as acted on
  markInsightActed: async (insightId) => {
    const response = await api.post(`/supernova/insights/${insightId}/action`);
    return response.data;
  },

  // ============================================
  // ANALYTICS ENDPOINTS (Admin)
  // ============================================

  // Get usage analytics
  getAnalytics: async () => {
    const response = await api.get('/supernova/analytics');
    return response.data;
  },

  // Get all conversations for training
  getAllConversations: async (type = null, limit = 100) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit);

    const response = await api.get(`/supernova/conversations/all?${params.toString()}`);
    return response.data;
  }
};

export default supernovaService;
