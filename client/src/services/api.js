import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
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

// Auth
export const auth = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Users
export const users = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  getUser: (id) => api.get(`/users/${id}`),
  listUsers: (params) => api.get('/users', { params }),
  submitQuiz: (data) => api.post('/users/quiz', data),
};

// SUPERNova
export const supernova = {
  getConversations: () => api.get('/supernova/conversations'),
  createConversation: () => api.post('/supernova/conversations'),
  getConversation: (id) => api.get(`/supernova/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/supernova/conversations/${id}`),
  sendMessage: (data) => api.post('/supernova/chat', data),
  sendMessageStream: (data) => api.post('/supernova/chat/stream', data),
};

// Marketplace
export const marketplace = {
  getListings: (params) => api.get('/marketplace', { params }),
  getListing: (id) => api.get(`/marketplace/${id}`),
  createListing: (data) => api.post('/marketplace', data),
  updateListing: (id, data) => api.patch(`/marketplace/${id}`, data),
  deleteListing: (id) => api.delete(`/marketplace/${id}`),
  purchaseListing: (id) => api.post(`/marketplace/${id}/purchase`),
  sendMessage: (id, content) => api.post(`/marketplace/${id}/messages`, { content }),
  getMessages: (id) => api.get(`/marketplace/${id}/messages`),
  myListings: () => api.get('/marketplace/my/listings'),
};

// Community
export const community = {
  getCategories: () => api.get('/community/categories'),
  getPosts: (params) => api.get('/community/posts', { params }),
  getPost: (id) => api.get(`/community/posts/${id}`),
  createPost: (data) => api.post('/community/posts', data),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
  addComment: (postId, data) => api.post(`/community/posts/${postId}/comments`, data),
  toggleLike: (postId) => api.post(`/community/posts/${postId}/like`),
};

// Messages
export const messages = {
  getConversations: () => api.get('/messages'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (userId, content) => api.post(`/messages/${userId}`, { content }),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// Notifications
export const notifications = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
};

// Content
export const content = {
  browse: (params) => api.get('/content', { params }),
  get: (id) => api.get(`/content/${id}`),
  updateProgress: (id, data) => api.post(`/content/${id}/progress`, data),
  curate: (data) => api.post('/content/curate', data),
  getRecommendations: () => api.get('/content/recommendations'),
  myProgress: () => api.get('/content/my/progress'),
};

// Payments
export const payments = {
  createUpgradeIntent: () => api.post('/payments/create-upgrade-intent'),
  createSubscription: (plan) => api.post('/payments/create-subscription', { plan }),
  getHistory: () => api.get('/payments/history'),
  getSubscription: () => api.get('/payments/subscription'),
  cancelSubscription: () => api.post('/payments/cancel-subscription'),
};

// Upload
export const upload = {
  image: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  avatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listingImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/listing-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Admin
export const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createContent: (data) => api.post('/admin/content', data),
  getContent: (params) => api.get('/admin/content', { params }),
  updateContent: (id, data) => api.patch(`/admin/content/${id}`, data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),
  createCategory: (data) => api.post('/admin/forum-categories', data),
  getAnalytics: () => api.get('/admin/analytics'),
};

// Phase 2D - User Empowerment Tools

// Quizzes
export const quizzes = {
  list: () => api.get('/quizzes'),
  create: (data) => api.post('/quizzes', data),
  get: (id) => api.get(`/quizzes/${id}`),
  update: (id, data) => api.patch(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  getBySlug: (slug) => api.get(`/quizzes/slug/${slug}`),
  addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (quizId, questionId, data) => api.patch(`/quizzes/${quizId}/questions/${questionId}`, data),
  deleteQuestion: (quizId, questionId) => api.delete(`/quizzes/${quizId}/questions/${questionId}`),
  getResponses: (quizId) => api.get(`/quizzes/${quizId}/responses`),
  submitResponse: (quizId, data) => api.post(`/quizzes/${quizId}/responses`, data),
  getAnalytics: (quizId) => api.get(`/quizzes/${quizId}/analytics`),
};

// Links Pages
export const linksPage = {
  get: () => api.get('/links-page'),
  createOrUpdate: (data) => api.post('/links-page', data),
  getByUsername: (username) => api.get(`/links-page/@${username}`),
  addLink: (data) => api.post('/links-page/links', data),
  updateLink: (id, data) => api.patch(`/links-page/links/${id}`, data),
  deleteLink: (id) => api.delete(`/links-page/links/${id}`),
  trackClick: (linkId) => api.post(`/links-page/track-click/${linkId}`),
};

// Short Links
export const shortLinks = {
  list: () => api.get('/short-links'),
  create: (data) => api.post('/short-links', data),
  get: (id) => api.get(`/short-links/${id}`),
  update: (id, data) => api.patch(`/short-links/${id}`, data),
  delete: (id) => api.delete(`/short-links/${id}`),
  getAnalytics: (shortCode) => api.get(`/short-links/${shortCode}/analytics`),
  redirect: (shortCode) => api.get(`/short-links/s/${shortCode}`),
};

// Brand Hub
export const brandHub = {
  get: () => api.get('/brand-hub'),
  createOrUpdate: (data) => api.post('/brand-hub', data),
  getByUsername: (username) => api.get(`/brand-hub/u/${username}`),
};

export default api;
