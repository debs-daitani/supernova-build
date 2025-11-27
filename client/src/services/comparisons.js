import api from './api';

const comparisonsService = {
  // Get all competitor tools
  getTools: async (params = {}) => {
    const { category } = params;
    const queryParams = new URLSearchParams();

    if (category) queryParams.append('category', category);

    const response = await api.get(`/comparisons/tools?${queryParams.toString()}`);
    return response.data;
  },

  // Get tools by category
  getToolsByCategory: async (category) => {
    const response = await api.get(`/comparisons/tools/category/${category}`);
    return response.data;
  },

  // Get feature comparison matrix
  getFeatures: async (params = {}) => {
    const { category } = params;
    const queryParams = new URLSearchParams();

    if (category) queryParams.append('category', category);

    const response = await api.get(`/comparisons/features?${queryParams.toString()}`);
    return response.data;
  },

  // Get comparison data for specific competitor
  getCompetitorComparison: async (competitor) => {
    const response = await api.get(`/comparisons/vs/${competitor}`);
    return response.data;
  },

  // Calculate ROI
  calculateROI: async (data) => {
    const response = await api.post('/comparisons/calculate-roi', data);
    return response.data;
  },

  // Get ROI calculation by ID
  getROICalculation: async (id) => {
    const response = await api.get(`/comparisons/roi/${id}`);
    return response.data;
  },

  // Get available categories
  getCategories: async () => {
    const response = await api.get('/comparisons/categories');
    return response.data;
  },

  // Admin - Get all tools
  getAdminTools: async () => {
    const response = await api.get('/comparisons/admin/tools');
    return response.data;
  },

  // Admin - Create tool
  createTool: async (toolData) => {
    const response = await api.post('/comparisons/admin/tools', toolData);
    return response.data;
  },

  // Admin - Update tool
  updateTool: async (id, toolData) => {
    const response = await api.patch(`/comparisons/admin/tools/${id}`, toolData);
    return response.data;
  },

  // Admin - Delete tool
  deleteTool: async (id) => {
    const response = await api.delete(`/comparisons/admin/tools/${id}`);
    return response.data;
  },

  // Admin - Get all features
  getAdminFeatures: async () => {
    const response = await api.get('/comparisons/admin/features');
    return response.data;
  },

  // Admin - Create feature
  createFeature: async (featureData) => {
    const response = await api.post('/comparisons/admin/features', featureData);
    return response.data;
  },

  // Admin - Update feature
  updateFeature: async (id, featureData) => {
    const response = await api.patch(`/comparisons/admin/features/${id}`, featureData);
    return response.data;
  },

  // Admin - Delete feature
  deleteFeature: async (id) => {
    const response = await api.delete(`/comparisons/admin/features/${id}`);
    return response.data;
  },

  // Admin - Get ROI calculations
  getROICalculations: async (params = {}) => {
    const { limit, offset } = params;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);

    const response = await api.get(`/comparisons/admin/roi-calculations?${queryParams.toString()}`);
    return response.data;
  },
};

export default comparisonsService;
