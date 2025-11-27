import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  requestPasswordReset: (email) => api.post('/auth/password-reset/request', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/password-reset/confirm', { token, newPassword }),
};

// Conversations API
export const conversationsAPI = {
  getAll: (params) => api.get('/conversations', { params }),
  getById: (id) => api.get(`/conversations/${id}`),
  create: (data) => api.post('/conversations', data),
  update: (id, data) => api.patch(`/conversations/${id}`, data),
  delete: (id) => api.delete(`/conversations/${id}`),
  sendMessage: (id, content) => api.post(`/conversations/${id}/messages`, { content }),
  search: (query) => api.get('/conversations/search/messages', { params: { q: query } }),
};

// Memories API
export const memoriesAPI = {
  getAll: (params) => api.get('/memories', { params }),
  create: (data) => api.post('/memories', data),
  update: (id, data) => api.patch(`/memories/${id}`, data),
  delete: (id) => api.delete(`/memories/${id}`),
};

// Payments API
export const paymentsAPI = {
  createUpgradeCheckout: () => api.post('/payments/checkout/upgrade'),
  createSubscriptionCheckout: (plan) => api.post('/payments/checkout/subscription', { plan }),
  getHistory: () => api.get('/payments/history'),
  cancelSubscription: () => api.post('/payments/subscription/cancel'),
};

// Marketplace API
export const marketplaceAPI = {
  getListings: (params) => api.get('/marketplace', { params }),
  getListing: (id) => api.get(`/marketplace/${id}`),
  createListing: (data) => api.post('/marketplace', data),
  updateListing: (id, data) => api.patch(`/marketplace/${id}`, data),
  deleteListing: (id) => api.delete(`/marketplace/${id}`),
  getMyListings: () => api.get('/marketplace/seller/my-listings'),
  sendMessage: (id, message) => api.post(`/marketplace/${id}/messages`, { message }),
  getMessages: (id) => api.get(`/marketplace/${id}/messages`),
};

// Community API
export const communityAPI = {
  getMembers: (params) => api.get('/community/members', { params }),
  getMember: (id) => api.get(`/community/members/${id}`),
  getCategories: () => api.get('/community/forums/categories'),
  getPosts: (slug, params) => api.get(`/community/forums/categories/${slug}/posts`, { params }),
  getPost: (id) => api.get(`/community/forums/posts/${id}`),
  createPost: (data) => api.post('/community/forums/posts', data),
  createComment: (postId, data) => api.post(`/community/forums/posts/${postId}/comments`, data),
  likePost: (id) => api.post(`/community/forums/posts/${id}/like`),
  getDirectMessages: () => api.get('/community/messages'),
  getMessagesWithUser: (userId) => api.get(`/community/messages/${userId}`),
  sendDirectMessage: (userId, message) => api.post(`/community/messages/${userId}`, { message }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getContent: () => api.get('/admin/content'),
  createContent: (data) => api.post('/admin/content', data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),
  getMarketplaceListings: () => api.get('/admin/marketplace'),
  featureListing: (id) => api.patch(`/admin/marketplace/${id}/feature`),
  removeListing: (id) => api.delete(`/admin/marketplace/${id}`),
  getForumPosts: () => api.get('/admin/forums/posts'),
  deletePost: (id) => api.delete(`/admin/forums/posts/${id}`),
  getPayments: (params) => api.get('/admin/payments', { params }),
};

export default api;
