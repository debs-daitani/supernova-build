import api from './api';

const demoVideosService = {
  // Public - Get all published demo videos
  getVideos: async (params = {}) => {
    const { category, videoType, featured, limit, offset } = params;
    const queryParams = new URLSearchParams();

    if (category) queryParams.append('category', category);
    if (videoType) queryParams.append('videoType', videoType);
    if (featured) queryParams.append('featured', 'true');
    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);

    const response = await api.get(`/demos/videos?${queryParams.toString()}`);
    return response.data;
  },

  // Public - Get single video
  getVideo: async (id) => {
    const response = await api.get(`/demos/videos/${id}`);
    return response.data;
  },

  // Public - Log video view
  logView: async (videoId, viewData) => {
    const response = await api.post(`/demos/videos/${videoId}/view`, viewData);
    return response.data;
  },

  // User - Get my recordings
  getMyRecordings: async (params = {}) => {
    const { limit, offset } = params;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);

    const response = await api.get(`/demos/recordings?${queryParams.toString()}`);
    return response.data;
  },

  // User - Upload recording
  uploadRecording: async (recordingData) => {
    const response = await api.post('/demos/recordings', recordingData);
    return response.data;
  },

  // User - Delete recording
  deleteRecording: async (id) => {
    const response = await api.delete(`/demos/recordings/${id}`);
    return response.data;
  },

  // User - Submit testimonial
  submitTestimonial: async (testimonialData) => {
    const response = await api.post('/demos/testimonials', testimonialData);
    return response.data;
  },

  // User - Get my testimonials
  getMyTestimonials: async () => {
    const response = await api.get('/demos/testimonials/my');
    return response.data;
  },

  // Public - Get approved testimonials
  getTestimonials: async (params = {}) => {
    const { featured, limit } = params;
    const queryParams = new URLSearchParams();

    if (featured) queryParams.append('featured', 'true');
    if (limit) queryParams.append('limit', limit);

    const response = await api.get(`/demos/testimonials?${queryParams.toString()}`);
    return response.data;
  },

  // Admin - Create demo video
  createVideo: async (videoData) => {
    const response = await api.post('/demos/videos', videoData);
    return response.data;
  },

  // Admin - Update demo video
  updateVideo: async (id, videoData) => {
    const response = await api.patch(`/demos/videos/${id}`, videoData);
    return response.data;
  },

  // Admin - Delete demo video
  deleteVideo: async (id) => {
    const response = await api.delete(`/demos/videos/${id}`);
    return response.data;
  },

  // Admin - Get all videos (including unpublished)
  getAdminVideos: async (params = {}) => {
    const { limit, offset } = params;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);

    const response = await api.get(`/demos/admin/videos?${queryParams.toString()}`);
    return response.data;
  },

  // Admin - Get video analytics
  getAnalytics: async (videoId) => {
    const response = await api.get(`/demos/analytics/${videoId}`);
    return response.data;
  },

  // Admin - Get all testimonials
  getAdminTestimonials: async (status = 'pending') => {
    const response = await api.get(`/demos/admin/testimonials?status=${status}`);
    return response.data;
  },

  // Admin - Review testimonial
  reviewTestimonial: async (id, reviewData) => {
    const response = await api.patch(`/demos/testimonials/${id}/review`, reviewData);
    return response.data;
  },
};

export default demoVideosService;
