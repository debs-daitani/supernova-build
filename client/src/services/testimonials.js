import api from './api';

const testimonialsService = {
  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  // Get approved testimonials
  getTestimonials: async (params = {}) => {
    const { category, featured, minRating, limit, offset } = params;
    const queryParams = new URLSearchParams();

    if (category) queryParams.append('category', category);
    if (featured !== undefined) queryParams.append('featured', featured);
    if (minRating) queryParams.append('minRating', minRating);
    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);

    const response = await api.get(`/testimonials?${queryParams.toString()}`);
    return response.data;
  },

  // Get featured testimonials
  getFeatured: async (limit = 3) => {
    const response = await api.get(`/testimonials/featured?limit=${limit}`);
    return response.data;
  },

  // Get testimonial stats
  getStats: async () => {
    const response = await api.get('/testimonials/stats');
    return response.data;
  },

  // ============================================
  // USER ENDPOINTS
  // ============================================

  // Submit testimonial
  submitTestimonial: async (data) => {
    const response = await api.post('/testimonials/submit', data);
    return response.data;
  },

  // Get user's testimonials
  getMyTestimonials: async () => {
    const response = await api.get('/testimonials/my-testimonials');
    return response.data;
  },

  // Update own testimonial (if pending)
  updateTestimonial: async (id, data) => {
    const response = await api.patch(`/testimonials/${id}`, data);
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Get pending testimonials
  getPendingTestimonials: async () => {
    const response = await api.get('/testimonials/admin/pending');
    return response.data;
  },

  // Get all testimonials
  getAllTestimonials: async (status = null) => {
    const queryParams = status ? `?status=${status}` : '';
    const response = await api.get(`/testimonials/admin/all${queryParams}`);
    return response.data;
  },

  // Approve testimonial
  approveTestimonial: async (id, data = {}) => {
    const response = await api.patch(`/testimonials/admin/${id}/approve`, data);
    return response.data;
  },

  // Feature testimonial
  featureTestimonial: async (id, data = {}) => {
    const response = await api.patch(`/testimonials/admin/${id}/feature`, data);
    return response.data;
  },

  // Reject testimonial
  rejectTestimonial: async (id) => {
    const response = await api.patch(`/testimonials/admin/${id}/reject`);
    return response.data;
  },

  // Delete testimonial
  deleteTestimonial: async (id) => {
    const response = await api.delete(`/testimonials/admin/${id}`);
    return response.data;
  },

  // Send testimonial request
  sendTestimonialRequest: async (data) => {
    const response = await api.post('/testimonials/admin/request', data);
    return response.data;
  },

  // Get testimonial requests
  getTestimonialRequests: async (status = null) => {
    const queryParams = status ? `?status=${status}` : '';
    const response = await api.get(`/testimonials/admin/requests${queryParams}`);
    return response.data;
  },

  // ============================================
  // WIDGET ENDPOINTS
  // ============================================

  // Create widget
  createWidget: async (widgetData) => {
    const response = await api.post('/testimonials/widgets', widgetData);
    return response.data;
  },

  // Get widget config
  getWidget: async (id) => {
    const response = await api.get(`/testimonials/widgets/${id}`);
    return response.data;
  },

  // Get testimonials for widget (with config)
  renderWidget: async (id) => {
    const response = await api.get(`/testimonials/widgets/${id}/render`);
    return response.data;
  },
};

export default testimonialsService;
