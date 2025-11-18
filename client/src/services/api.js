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

// Phase 2F - Chatbot Builder

// Chatbots
export const chatbots = {
  list: () => api.get('/chatbots'),
  create: (data) => api.post('/chatbots', data),
  get: (id) => api.get(`/chatbots/${id}`),
  update: (id, data) => api.patch(`/chatbots/${id}`, data),
  delete: (id) => api.delete(`/chatbots/${id}`),
  // Flows
  listFlows: (chatbotId) => api.get(`/chatbots/${chatbotId}/flows`),
  getFlow: (chatbotId, flowId) => api.get(`/chatbots/${chatbotId}/flows/${flowId}`),
  createFlow: (chatbotId, data) => api.post(`/chatbots/${chatbotId}/flows`, data),
  updateFlow: (chatbotId, flowId, data) => api.patch(`/chatbots/${chatbotId}/flows/${flowId}`, data),
  deleteFlow: (chatbotId, flowId) => api.delete(`/chatbots/${chatbotId}/flows/${flowId}`),
  // Triggers
  listTriggers: (chatbotId) => api.get(`/chatbots/${chatbotId}/triggers`),
  createTrigger: (chatbotId, data) => api.post(`/chatbots/${chatbotId}/triggers`, data),
  updateTrigger: (chatbotId, triggerId, data) => api.patch(`/chatbots/${chatbotId}/triggers/${triggerId}`, data),
  deleteTrigger: (chatbotId, triggerId) => api.delete(`/chatbots/${chatbotId}/triggers/${triggerId}`),
  // Analytics
  getAnalytics: (chatbotId) => api.get(`/chatbots/${chatbotId}/analytics`),
  getConversations: (chatbotId) => api.get(`/chatbots/${chatbotId}/conversations`),
  getConversation: (chatbotId, convId) => api.get(`/chatbots/${chatbotId}/conversations/${convId}`),
};

// Chat Widget (Public API - no auth)
export const chatWidget = {
  start: (data) => api.post('/chat/start', data),
  sendMessage: (conversationId, data) => api.post(`/chat/${conversationId}/message`, data),
  getMessages: (conversationId) => api.get(`/chat/${conversationId}/messages`),
  handoff: (conversationId) => api.post(`/chat/${conversationId}/handoff`),
  complete: (conversationId) => api.post(`/chat/${conversationId}/complete`),
  checkTrigger: (data) => api.post('/chat/check-trigger', data),
};

// Phase 2F Addendum - Social Media Automation

// Social Accounts
export const socialAccounts = {
  list: () => api.get('/social/accounts'),
  connectInstagram: (data) => api.post('/social/instagram/connect', data),
  connectFacebook: (data) => api.post('/social/facebook/connect', data),
  disconnect: (accountId) => api.delete(`/social/accounts/${accountId}`),
};

// Social Automations
export const socialAutomations = {
  list: () => api.get('/social/automations'),
  create: (data) => api.post('/social/automations', data),
  update: (id, data) => api.patch(`/social/automations/${id}`, data),
  delete: (id) => api.delete(`/social/automations/${id}`),
};

// Social Conversations
export const socialConversations = {
  list: () => api.get('/social/conversations'),
  get: (id) => api.get(`/social/conversations/${id}`),
  takeover: (id) => api.post(`/social/conversations/${id}/takeover`),
};

// Social Analytics
export const socialAnalytics = {
  get: () => api.get('/social/analytics'),
};

// Phase 2G - Website Builder

// Websites
export const websites = {
  list: () => api.get('/websites'),
  get: (id) => api.get(`/websites/${id}`),
  create: (data) => api.post('/websites', data),
  update: (id, data) => api.patch(`/websites/${id}`, data),
  delete: (id) => api.delete(`/websites/${id}`),
  publish: (id, publish) => api.post(`/websites/${id}/publish`, { publish }),
};

// Website Pages
export const websitePages = {
  list: (websiteId) => api.get(`/websites/${websiteId}/pages`),
  create: (websiteId, data) => api.post(`/websites/${websiteId}/pages`, data),
  update: (websiteId, pageId, data) => api.patch(`/websites/${websiteId}/pages/${pageId}`, data),
  delete: (websiteId, pageId) => api.delete(`/websites/${websiteId}/pages/${pageId}`),
};

// Website Templates
export const websiteTemplates = {
  list: () => api.get('/websites/templates/all'),
  get: (id) => api.get(`/websites/templates/${id}`),
};

// Phase 2Q + 2R - AI Generation (Image & Video)

// AI Image Generation
export const aiImages = {
  generate: (data) => api.post('/ai/generate-image', data),
  list: (params) => api.get('/ai/images', { params }),
  get: (id) => api.get(`/ai/images/${id}`),
  save: (id) => api.post(`/ai/images/${id}/save`),
  markUsed: (id, usedIn) => api.post(`/ai/images/${id}/mark-used`, { usedIn }),
  delete: (id) => api.delete(`/ai/images/${id}`),
};

// AI Video Generation
export const aiVideos = {
  generate: (data) => api.post('/ai/generate-video', data),
  list: (params) => api.get('/ai/videos', { params }),
  get: (id) => api.get(`/ai/videos/${id}`),
  getStatus: (id) => api.get(`/ai/videos/${id}/status`),
  save: (id) => api.post(`/ai/videos/${id}/save`),
  delete: (id) => api.delete(`/ai/videos/${id}`),
};

// Phase 2H - CRM + Accounting + Financial Tools

// CRM - Contacts
export const crmContacts = {
  list: (params) => api.get('/crm/contacts', { params }),
  create: (data) => api.post('/crm/contacts', data),
  get: (id) => api.get(`/crm/contacts/${id}`),
  update: (id, data) => api.patch(`/crm/contacts/${id}`, data),
  delete: (id) => api.delete(`/crm/contacts/${id}`),
};

// CRM - Deals
export const crmDeals = {
  list: (params) => api.get('/crm/deals', { params }),
  create: (data) => api.post('/crm/deals', data),
  get: (id) => api.get(`/crm/deals/${id}`),
  update: (id, data) => api.patch(`/crm/deals/${id}`, data),
  delete: (id) => api.delete(`/crm/deals/${id}`),
};

// CRM - Tasks
export const crmTasks = {
  list: (params) => api.get('/crm/tasks', { params }),
  create: (data) => api.post('/crm/tasks', data),
  get: (id) => api.get(`/crm/tasks/${id}`),
  update: (id, data) => api.patch(`/crm/tasks/${id}`, data),
  delete: (id) => api.delete(`/crm/tasks/${id}`),
  complete: (id) => api.patch(`/crm/tasks/${id}/complete`),
};

// CRM - Activities
export const crmActivities = {
  list: (params) => api.get('/crm/activities', { params }),
  create: (data) => api.post('/crm/activities', data),
};

// CRM - Stats
export const crmStats = {
  get: () => api.get('/crm/stats'),
};

// Accounting - Invoices
export const accountingInvoices = {
  list: (params) => api.get('/accounting/invoices', { params }),
  create: (data) => api.post('/accounting/invoices', data),
  get: (id) => api.get(`/accounting/invoices/${id}`),
  update: (id, data) => api.patch(`/accounting/invoices/${id}`, data),
  delete: (id) => api.delete(`/accounting/invoices/${id}`),
  markPaid: (id) => api.post(`/accounting/invoices/${id}/mark-paid`),
};

// Accounting - Expenses
export const accountingExpenses = {
  list: (params) => api.get('/accounting/expenses', { params }),
  create: (data) => api.post('/accounting/expenses', data),
  get: (id) => api.get(`/accounting/expenses/${id}`),
  update: (id, data) => api.patch(`/accounting/expenses/${id}`, data),
  delete: (id) => api.delete(`/accounting/expenses/${id}`),
};

// Accounting - Income
export const accountingIncome = {
  list: (params) => api.get('/accounting/income', { params }),
  create: (data) => api.post('/accounting/income', data),
  get: (id) => api.get(`/accounting/income/${id}`),
  delete: (id) => api.delete(`/accounting/income/${id}`),
};

// Accounting - Reports
export const accountingReports = {
  profitLoss: (params) => api.get('/accounting/reports/profit-loss', { params }),
  tax: (params) => api.get('/accounting/reports/tax', { params }),
};

// Accounting - Stats
export const accountingStats = {
  get: () => api.get('/accounting/stats'),
};

// Phase 2I - E-Commerce Shop

// Shop - Products
export const shopProducts = {
  list: (params) => api.get('/shop/products', { params }),
  create: (data) => api.post('/shop/products', data),
  get: (id) => api.get(`/shop/products/${id}`),
  update: (id, data) => api.patch(`/shop/products/${id}`, data),
  delete: (id) => api.delete(`/shop/products/${id}`),
  publish: (id, published) => api.patch(`/shop/products/${id}/publish`, { published }),
};

// Shop - Orders
export const shopOrders = {
  list: (params) => api.get('/shop/orders', { params }),
  get: (id) => api.get(`/shop/orders/${id}`),
  fulfill: (id) => api.patch(`/shop/orders/${id}/fulfill`),
  ship: (id, trackingNumber) => api.patch(`/shop/orders/${id}/ship`, { trackingNumber }),
  updateNotes: (id, internalNotes) => api.patch(`/shop/orders/${id}/notes`, { internalNotes }),
};

// Shop - Discounts
export const shopDiscounts = {
  list: (params) => api.get('/shop/discounts', { params }),
  create: (data) => api.post('/shop/discounts', data),
  update: (id, data) => api.patch(`/shop/discounts/${id}`, data),
  delete: (id) => api.delete(`/shop/discounts/${id}`),
};

// Shop - Reviews
export const shopReviews = {
  list: (params) => api.get('/shop/reviews', { params }),
  approve: (id) => api.patch(`/shop/reviews/${id}/approve`),
  delete: (id) => api.delete(`/shop/reviews/${id}`),
};

// Shop - Stats
export const shopStats = {
  get: () => api.get('/shop/stats'),
};

// ============================================================================
// Phase 2P - Task & Project Management
// ============================================================================

// Projects
export const projects = {
  list: (params) => api.get('/tasks/projects', { params }),
  create: (data) => api.post('/tasks/projects', data),
  get: (id) => api.get(`/tasks/projects/${id}`),
  update: (id, data) => api.patch(`/tasks/projects/${id}`, data),
  delete: (id) => api.delete(`/tasks/projects/${id}`),
};

// Sections
export const projectSections = {
  create: (data) => api.post('/tasks/sections', data),
  update: (id, data) => api.patch(`/tasks/sections/${id}`, data),
  delete: (id) => api.delete(`/tasks/sections/${id}`),
};

// Tasks
export const tasks = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  get: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Subtasks
export const subtasks = {
  create: (taskId, data) => api.post(`/tasks/${taskId}/subtasks`, data),
  complete: (id) => api.patch(`/tasks/subtasks/${id}/complete`),
  delete: (id) => api.delete(`/tasks/subtasks/${id}`),
};

// Comments
export const taskComments = {
  create: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  delete: (id) => api.delete(`/tasks/comments/${id}`),
};

// Time Tracking
export const timeTracking = {
  start: (taskId, data) => api.post(`/tasks/${taskId}/time/start`, data),
  stop: (id) => api.patch(`/tasks/time/${id}/stop`),
  log: (taskId, data) => api.post(`/tasks/${taskId}/time`, data),
  list: (taskId) => api.get(`/tasks/${taskId}/time`),
  active: () => api.get('/tasks/time/active'),
  delete: (id) => api.delete(`/tasks/time/${id}`),
};

// Habits
export const habits = {
  list: (params) => api.get('/tasks/habits', { params }),
  create: (data) => api.post('/tasks/habits', data),
  update: (id, data) => api.patch(`/tasks/habits/${id}`, data),
  complete: (id, data) => api.post(`/tasks/habits/${id}/complete`, data),
  delete: (id) => api.delete(`/tasks/habits/${id}`),
};

// Goals
export const goals = {
  list: (params) => api.get('/tasks/goals', { params }),
  create: (data) => api.post('/tasks/goals', data),
  update: (id, data) => api.patch(`/tasks/goals/${id}`, data),
  delete: (id) => api.delete(`/tasks/goals/${id}`),
};

// Task Stats
export const taskStats = {
  get: () => api.get('/tasks/stats'),
};

// ============================================================================
// Phase 2E - Content Creation Suite
// ============================================================================

// Design Templates
export const designTemplates = {
  list: (params) => api.get('/content-creation/templates', { params }),
  get: (id) => api.get(`/content-creation/templates/${id}`),
};

// Saved Designs
export const savedDesigns = {
  list: (params) => api.get('/content-creation/designs', { params }),
  create: (data) => api.post('/content-creation/designs', data),
  get: (id) => api.get(`/content-creation/designs/${id}`),
  update: (id, data) => api.patch(`/content-creation/designs/${id}`, data),
  delete: (id) => api.delete(`/content-creation/designs/${id}`),
};

// Content Posts
export const contentPosts = {
  list: (params) => api.get('/content-creation/posts', { params }),
  create: (data) => api.post('/content-creation/posts', data),
  get: (id) => api.get(`/content-creation/posts/${id}`),
  update: (id, data) => api.patch(`/content-creation/posts/${id}`, data),
  schedule: (id, data) => api.post(`/content-creation/posts/${id}/schedule`, data),
  publish: (id) => api.post(`/content-creation/posts/${id}/publish`),
  duplicate: (id) => api.post(`/content-creation/posts/${id}/duplicate`),
  delete: (id) => api.delete(`/content-creation/posts/${id}`),
};

// Content Ideas
export const contentIdeas = {
  list: (params) => api.get('/content-creation/ideas', { params }),
  create: (data) => api.post('/content-creation/ideas', data),
  update: (id, data) => api.patch(`/content-creation/ideas/${id}`, data),
  delete: (id) => api.delete(`/content-creation/ideas/${id}`),
};

// Brand Assets
export const brandAssets = {
  list: (params) => api.get('/content-creation/brand-assets', { params }),
  create: (data) => api.post('/content-creation/brand-assets', data),
  update: (id, data) => api.patch(`/content-creation/brand-assets/${id}`, data),
  delete: (id) => api.delete(`/content-creation/brand-assets/${id}`),
};

// AI Tools
export const contentAI = {
  generateCaption: (data) => api.post('/content-creation/generate-caption', data),
  generateHashtags: (data) => api.post('/content-creation/generate-hashtags', data),
  generateIdeas: (data) => api.post('/content-creation/generate-ideas', data),
};

// Content Stats
export const contentStats = {
  get: () => api.get('/content-creation/stats'),
};

// ============================================================================
// Phase 2M - Video Tools Suite
// ============================================================================

// Video Scripts
export const videoScripts = {
  generate: (data) => api.post('/video/scripts/generate', data),
  list: () => api.get('/video/scripts'),
  get: (id) => api.get(`/video/scripts/${id}`),
  update: (id, data) => api.patch(`/video/scripts/${id}`, data),
  delete: (id) => api.delete(`/video/scripts/${id}`),
};

// Videos
export const videos = {
  list: (params) => api.get('/video/videos', { params }),
  create: (data) => api.post('/video/videos', data),
  get: (id) => api.get(`/video/videos/${id}`),
  update: (id, data) => api.patch(`/video/videos/${id}`, data),
  delete: (id) => api.delete(`/video/videos/${id}`),
};

// Video SEO
export const videoSEO = {
  generateTitles: (data) => api.post('/video/seo/title', data),
  generateDescription: (data) => api.post('/video/seo/description', data),
  generateTags: (data) => api.post('/video/seo/tags', data),
};

// Video Templates
export const videoTemplates = {
  list: (params) => api.get('/video/templates', { params }),
  get: (id) => api.get(`/video/templates/${id}`),
};

// Video Stats
export const videoStats = {
  get: () => api.get('/video/stats'),
};

// ============================================================================
// Phase 2N - AI Content Generator
// ============================================================================

// Content Generation
export const aiContentGenerator = {
  // Blog posts
  generateBlog: (data) => api.post('/content-ai/blog', data),

  // Social media
  generateCaption: (data) => api.post('/content-ai/caption', data),

  // Email
  generateEmailSubject: (data) => api.post('/content-ai/email-subject', data),

  // Product descriptions
  generateProductDesc: (data) => api.post('/content-ai/product-desc', data),

  // SEO meta
  generateMetaDesc: (data) => api.post('/content-ai/meta-desc', data),

  // Landing pages
  generateLandingPage: (data) => api.post('/content-ai/landing-page', data),

  // Ad copy
  generateAdCopy: (data) => api.post('/content-ai/ad-copy', data),

  // Content repurposing
  repurpose: (data) => api.post('/content-ai/repurpose', data),

  // Writing assistant
  improve: (data) => api.post('/content-ai/improve', data),
};

// Generated Content History
export const generatedContent = {
  list: (params) => api.get('/content-ai/generated', { params }),
  get: (id) => api.get(`/content-ai/generated/${id}`),
  rate: (id, rating) => api.patch(`/content-ai/generated/${id}/rate`, { rating }),
  delete: (id) => api.delete(`/content-ai/generated/${id}`),
};

// Content Briefs
export const contentBriefs = {
  list: (params) => api.get('/content-ai/briefs', { params }),
  create: (data) => api.post('/content-ai/briefs', data),
  get: (id) => api.get(`/content-ai/briefs/${id}`),
  update: (id, data) => api.patch(`/content-ai/briefs/${id}`, data),
  delete: (id) => api.delete(`/content-ai/briefs/${id}`),
};

// AI Content Stats
export const aiContentStats = {
  get: () => api.get('/content-ai/stats'),
};

// ============================================================================
// Phase 2AS - Messaging Platform
// ============================================================================

// Conversations
export const platformConversations = {
  list: (params) => api.get('/platform-messages/conversations', { params }),
  create: (data) => api.post('/platform-messages/conversations', data),
  get: (id) => api.get(`/platform-messages/conversations/${id}`),
  update: (id, data) => api.patch(`/platform-messages/conversations/${id}`, data),
  delete: (id) => api.delete(`/platform-messages/conversations/${id}`),
  archive: (id) => api.post(`/platform-messages/conversations/${id}/archive`),
  mute: (id, muted) => api.post(`/platform-messages/conversations/${id}/mute`, { muted }),
  readAll: (id) => api.post(`/platform-messages/conversations/${id}/read-all`),
};

// Messages
export const platformMessages = {
  list: (conversationId, params) => api.get(`/platform-messages/conversations/${conversationId}/messages`, { params }),
  send: (conversationId, data) => api.post(`/platform-messages/conversations/${conversationId}/messages`, data),
  edit: (id, data) => api.patch(`/platform-messages/messages/${id}`, data),
  delete: (id) => api.delete(`/platform-messages/messages/${id}`),
  markRead: (id) => api.post(`/platform-messages/messages/${id}/read`),
};

// Status Updates
export const platformStatus = {
  create: (data) => api.post('/platform-messages/status', data),
  list: () => api.get('/platform-messages/status'),
  view: (id) => api.post(`/platform-messages/status/${id}/view`),
  delete: (id) => api.delete(`/platform-messages/status/${id}`),
};

// Blocking
export const platformBlocking = {
  block: (userId) => api.post(`/platform-messages/block/${userId}`),
  unblock: (userId) => api.delete(`/platform-messages/block/${userId}`),
  list: () => api.get('/platform-messages/blocked'),
};

// Calls
export const platformCalls = {
  initiate: (data) => api.post('/platform-messages/calls/initiate', data),
  end: (id) => api.post(`/platform-messages/calls/${id}/end`),
  history: () => api.get('/platform-messages/calls/history'),
};

// ============================================================================
// Phase 2J - Events Platform
// ============================================================================

// Events
export const events = {
  list: (params) => api.get('/events', { params }),
  get: (slug) => api.get(`/events/${slug}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  publish: (id) => api.post(`/events/${id}/publish`),
  duplicate: (id) => api.post(`/events/${id}/duplicate`),
};

// Event Registrations
export const eventRegistrations = {
  register: (eventId, data) => api.post(`/events/${eventId}/register`, data),
  list: (eventId) => api.get(`/events/${eventId}/registrations`),
  update: (eventId, regId, data) => api.patch(`/events/${eventId}/registrations/${regId}`, data),
  checkIn: (eventId, regId) => api.post(`/events/${eventId}/registrations/${regId}/check-in`),
  cancel: (eventId, regId) => api.post(`/events/${eventId}/registrations/${regId}/cancel`),
};

// Event Analytics
export const eventAnalytics = {
  get: (eventId) => api.get(`/events/${eventId}/analytics`),
};

// ============================================================================
// Phase 2O - Legal Templates + Launch Toolkit
// ============================================================================

// Legal Documents
export const legalDocuments = {
  generate: (data) => api.post('/legal/generate', data),
  list: (params) => api.get('/legal/documents', { params }),
  get: (id) => api.get(`/legal/documents/${id}`),
  update: (id, data) => api.patch(`/legal/documents/${id}`, data),
  delete: (id) => api.delete(`/legal/documents/${id}`),
  gdprCheck: (websiteUrl) => api.post('/legal/gdpr-check', { websiteUrl }),
};

// Launches
export const launches = {
  create: (data) => api.post('/launch', data),
  list: (params) => api.get('/launch', { params }),
  get: (id) => api.get(`/launch/${id}`),
  update: (id, data) => api.patch(`/launch/${id}`, data),
  delete: (id) => api.delete(`/launch/${id}`),
};

// Launch Checklist
export const launchChecklist = {
  add: (launchId, data) => api.post(`/launch/${launchId}/checklist`, data),
  update: (launchId, itemId, data) => api.patch(`/launch/${launchId}/checklist/${itemId}`, data),
  toggle: (launchId, itemId) => api.post(`/launch/${launchId}/checklist/${itemId}/toggle`),
  delete: (launchId, itemId) => api.delete(`/launch/${launchId}/checklist/${itemId}`),
};

// Waitlist
export const waitlist = {
  join: (launchId, data) => api.post(`/launch/${launchId}/waitlist`, data),
  list: (launchId) => api.get(`/launch/${launchId}/waitlist`),
  notify: (launchId, data) => api.post(`/launch/${launchId}/waitlist/notify`, data),
};

// ============================================================================
// Phase 2AC - Image Editor
// ============================================================================

// Image Projects
export const imageProjects = {
  create: (data) => api.post('/image-editor/projects', data),
  list: () => api.get('/image-editor/projects'),
  get: (id) => api.get(`/image-editor/projects/${id}`),
  update: (id, data) => api.patch(`/image-editor/projects/${id}`, data),
  delete: (id) => api.delete(`/image-editor/projects/${id}`),
  duplicate: (id) => api.post(`/image-editor/projects/${id}/duplicate`),
};

// Image Export
export const imageExport = {
  export: (data) => api.post('/image-editor/export', data),
};

// Image AI Tools
export const imageAI = {
  removeBackground: (imageUrl) => api.post('/image-editor/remove-bg', { imageUrl }),
  removeObject: (imageUrl, maskData) => api.post('/image-editor/remove-object', { imageUrl, maskData }),
  upscale: (imageUrl, scale) => api.post('/image-editor/upscale', { imageUrl, scale }),
  enhance: (imageUrl) => api.post('/image-editor/enhance', { imageUrl }),
  colorize: (imageUrl) => api.post('/image-editor/colorize', { imageUrl }),
};

// Image Assets
export const imageAssets = {
  upload: (data) => api.post('/image-editor/assets', data),
  list: (params) => api.get('/image-editor/assets', { params }),
  delete: (id) => api.delete(`/image-editor/assets/${id}`),
  use: (id) => api.post(`/image-editor/assets/${id}/use`),
};

// ============================================================================
// PHASE 2AE - VIDEO EDITOR
// ============================================================================

// Video Projects
export const videoProjects = {
  create: (data) => api.post('/video-editor/projects', data),
  list: () => api.get('/video-editor/projects'),
  get: (id) => api.get(`/video-editor/projects/${id}`),
  update: (id, data) => api.patch(`/video-editor/projects/${id}`, data),
  delete: (id) => api.delete(`/video-editor/projects/${id}`),
  duplicate: (id) => api.post(`/video-editor/projects/${id}/duplicate`),
};

// Video Clips
export const videoClips = {
  upload: (data) => api.post('/video-editor/clips', data),
  list: () => api.get('/video-editor/clips'),
  delete: (id) => api.delete(`/video-editor/clips/${id}`),
};

// Video Render
export const videoRender = {
  start: (data) => api.post('/video-editor/render', data),
  checkProgress: (jobId) => api.get(`/video-editor/render/${jobId}`),
  download: (jobId) => api.get(`/video-editor/render/${jobId}/download`),
};

// Stock Library
export const stockLibrary = {
  searchVideos: (params) => api.get('/video-editor/stock/videos', { params }),
  searchAudio: (params) => api.get('/video-editor/stock/audio', { params }),
};

// ============================================================================
// PHASE 2AF - PDF EDITOR
// ============================================================================

// PDF Documents
export const pdfDocuments = {
  upload: (data) => api.post('/pdf-editor/upload', data),
  list: () => api.get('/pdf-editor/documents'),
  get: (id) => api.get(`/pdf-editor/documents/${id}`),
  update: (id, data) => api.patch(`/pdf-editor/documents/${id}`, data),
  delete: (id) => api.delete(`/pdf-editor/documents/${id}`),
};

// PDF Annotations
export const pdfAnnotations = {
  add: (data) => api.post('/pdf-editor/annotations', data),
  list: (pdfId) => api.get(`/pdf-editor/annotations/${pdfId}`),
  delete: (id) => api.delete(`/pdf-editor/annotations/${id}`),
};

// PDF Signatures
export const pdfSignatures = {
  add: (data) => api.post('/pdf-editor/signatures', data),
  list: (pdfId) => api.get(`/pdf-editor/signatures/${pdfId}`),
};

// PDF Edit
export const pdfEdit = {
  edit: (data) => api.post('/pdf-editor/edit', data),
};

// PDF Manipulate
export const pdfManipulate = {
  merge: (data) => api.post('/pdf-editor/merge', data),
  split: (data) => api.post('/pdf-editor/split', data),
  compress: (data) => api.post('/pdf-editor/compress', data),
  rotate: (data) => api.post('/pdf-editor/rotate', data),
  deletePages: (data) => api.post('/pdf-editor/delete-pages', data),
};

// PDF Convert
export const pdfConvert = {
  toPdf: (data) => api.post('/pdf-editor/convert-to-pdf', data),
  fromPdf: (data) => api.post('/pdf-editor/convert-from-pdf', data),
};

// PDF Protect
export const pdfProtect = {
  protect: (data) => api.post('/pdf-editor/protect', data),
  watermark: (data) => api.post('/pdf-editor/watermark', data),
};

// PDF OCR
export const pdfOCR = {
  extract: (data) => api.post('/pdf-editor/ocr', data),
};

// PDF Templates
export const pdfTemplates = {
  list: (params) => api.get('/pdf-editor/templates', { params }),
  createFromTemplate: (data) => api.post('/pdf-editor/create-from-template', data),
};

// ============================================================================
// PHASE 2AG - DOCUMENT EDITOR
// ============================================================================

// Documents
export const documents = {
  create: (data) => api.post('/docs', data),
  list: (params) => api.get('/docs', { params }),
  get: (id) => api.get(`/docs/${id}`),
  update: (id, data) => api.patch(`/docs/${id}`, data),
  delete: (id) => api.delete(`/docs/${id}`),
  copy: (id) => api.post(`/docs/${id}/copy`),
  move: (id, data) => api.post(`/docs/${id}/move`, data),
};

// Document Folders
export const documentFolders = {
  create: (data) => api.post('/docs/folders', data),
  list: () => api.get('/docs/folders'),
  update: (id, data) => api.patch(`/docs/folders/${id}`, data),
  delete: (id) => api.delete(`/docs/folders/${id}`),
};

// Document Sharing
export const documentSharing = {
  share: (id, data) => api.post(`/docs/${id}/share`, data),
  generateLink: (id) => api.post(`/docs/${id}/share-link`),
  updatePermissions: (id, data) => api.patch(`/docs/${id}/permissions`, data),
  removeCollaborator: (id, userId) => api.delete(`/docs/${id}/collaborators/${userId}`),
};

// Document Comments
export const documentComments = {
  add: (id, data) => api.post(`/docs/${id}/comments`, data),
  list: (id, params) => api.get(`/docs/${id}/comments`, { params }),
  update: (docId, commentId, data) => api.patch(`/docs/${docId}/comments/${commentId}`, data),
  delete: (docId, commentId) => api.delete(`/docs/${docId}/comments/${commentId}`),
  resolve: (docId, commentId) => api.post(`/docs/${docId}/comments/${commentId}/resolve`),
};

// Document Versions
export const documentVersions = {
  list: (id) => api.get(`/docs/${id}/versions`),
  restore: (id, versionId) => api.post(`/docs/${id}/restore/${versionId}`),
};

// Document Export
export const documentExport = {
  pdf: (id) => api.get(`/docs/${id}/export/pdf`),
  docx: (id) => api.get(`/docs/${id}/export/docx`),
  txt: (id) => api.get(`/docs/${id}/export/txt`),
};

// Document Templates
export const documentTemplates = {
  list: (params) => api.get('/docs/templates', { params }),
  createFromTemplate: (templateId, data) => api.post(`/docs/from-template/${templateId}`, data),
};

// ============================================================================
// PHASE 2AH - SPREADSHEET EDITOR
// ============================================================================

// Spreadsheets
export const spreadsheets = {
  create: (data) => api.post('/sheets', data),
  list: (params) => api.get('/sheets', { params }),
  get: (id) => api.get(`/sheets/${id}`),
  update: (id, data) => api.patch(`/sheets/${id}`, data),
  delete: (id) => api.delete(`/sheets/${id}`),
  copy: (id) => api.post(`/sheets/${id}/copy`),
  move: (id, data) => api.post(`/sheets/${id}/move`, data),
};

// Spreadsheet Folders
export const spreadsheetFolders = {
  create: (data) => api.post('/sheets/folders', data),
  list: () => api.get('/sheets/folders'),
  update: (id, data) => api.patch(`/sheets/folders/${id}`, data),
  delete: (id) => api.delete(`/sheets/folders/${id}`),
};

// Spreadsheet Sharing
export const spreadsheetSharing = {
  share: (id, data) => api.post(`/sheets/${id}/share`, data),
  generateLink: (id) => api.post(`/sheets/${id}/share-link`),
  updatePermissions: (id, data) => api.patch(`/sheets/${id}/permissions`, data),
  removeCollaborator: (id, userId) => api.delete(`/sheets/${id}/collaborators/${userId}`),
};

// Spreadsheet Comments
export const spreadsheetComments = {
  add: (id, data) => api.post(`/sheets/${id}/comments`, data),
  list: (id, params) => api.get(`/sheets/${id}/comments`, { params }),
  update: (sheetId, commentId, data) => api.patch(`/sheets/${sheetId}/comments/${commentId}`, data),
  delete: (sheetId, commentId) => api.delete(`/sheets/${sheetId}/comments/${commentId}`),
  resolve: (sheetId, commentId) => api.post(`/sheets/${sheetId}/comments/${commentId}/resolve`),
};

// Spreadsheet Versions
export const spreadsheetVersions = {
  list: (id) => api.get(`/sheets/${id}/versions`),
  restore: (id, versionId) => api.post(`/sheets/${id}/restore/${versionId}`),
};

// Spreadsheet Import/Export
export const spreadsheetImportExport = {
  importCSV: (data) => api.post('/sheets/import/csv', data),
  importXLSX: (data) => api.post('/sheets/import/xlsx', data),
  exportCSV: (id) => api.get(`/sheets/${id}/export/csv`),
  exportXLSX: (id) => api.get(`/sheets/${id}/export/xlsx`),
  exportPDF: (id) => api.get(`/sheets/${id}/export/pdf`),
};

// Spreadsheet Templates
export const spreadsheetTemplates = {
  list: (params) => api.get('/sheets/templates', { params }),
  createFromTemplate: (templateId, data) => api.post(`/sheets/from-template/${templateId}`, data),
};

// ============================================
// Phase 2AI: Presentation Editor
// ============================================

// Presentations
export const presentations = {
  list: (params) => api.get('/presentations', { params }),
  get: (id) => api.get(`/presentations/${id}`),
  create: (data) => api.post('/presentations', data),
  update: (id, data) => api.put(`/presentations/${id}`, data),
  delete: (id) => api.delete(`/presentations/${id}`),
};

// Presentation Folders
export const presentationFolders = {
  list: () => api.get('/presentations/folders/list'),
  create: (data) => api.post('/presentations/folders/create', data),
  update: (id, data) => api.put(`/presentations/folders/${id}`, data),
  delete: (id) => api.delete(`/presentations/folders/${id}`),
};

// Presentation Sharing
export const presentationSharing = {
  generateShareLink: (id) => api.post(`/presentations/${id}/share`),
  removeShareLink: (id) => api.delete(`/presentations/${id}/share`),
  getShared: (shareLink) => api.get(`/presentations/shared/${shareLink}`),
  addCollaborator: (id, data) => api.post(`/presentations/${id}/collaborators`, data),
  updateCollaborator: (id, collaboratorId, data) => api.put(`/presentations/${id}/collaborators/${collaboratorId}`, data),
  removeCollaborator: (id, collaboratorId) => api.delete(`/presentations/${id}/collaborators/${collaboratorId}`),
};

// Presentation Comments
export const presentationComments = {
  list: (id) => api.get(`/presentations/${id}/comments`),
  create: (id, data) => api.post(`/presentations/${id}/comments`, data),
  resolve: (id, commentId, resolved) => api.put(`/presentations/${id}/comments/${commentId}/resolve`, { resolved }),
  delete: (id, commentId) => api.delete(`/presentations/${id}/comments/${commentId}`),
};

// Presentation Versions
export const presentationVersions = {
  list: (id) => api.get(`/presentations/${id}/versions`),
  create: (id, data) => api.post(`/presentations/${id}/versions`, data),
  restore: (id, versionId) => api.post(`/presentations/${id}/versions/${versionId}/restore`),
};

// Presentation Export
export const presentationExport = {
  exportPDF: (id) => api.post(`/presentations/${id}/export/pdf`),
  exportPPTX: (id) => api.post(`/presentations/${id}/export/pptx`),
  exportImages: (id, format) => api.post(`/presentations/${id}/export/images`, { format }),
};

// Presentation Templates
export const presentationTemplates = {
  list: (params) => api.get('/presentations/templates/list', { params }),
  get: (id) => api.get(`/presentations/templates/${id}`),
};

// Presentation Themes
export const presentationThemes = {
  list: () => api.get('/presentations/themes/list'),
  create: (data) => api.post('/presentations/themes/create', data),
  update: (id, data) => api.put(`/presentations/themes/${id}`, data),
  delete: (id) => api.delete(`/presentations/themes/${id}`),
};

// ============================================
// Phase 2AJ: Forms Builder
// ============================================

// Forms
export const forms = {
  list: (params) => api.get('/forms', { params }),
  get: (id) => api.get(`/forms/${id}`),
  create: (data) => api.post('/forms', data),
  update: (id, data) => api.patch(`/forms/${id}`, data),
  delete: (id) => api.delete(`/forms/${id}`),
  copy: (id) => api.post(`/forms/${id}/copy`),
  getPublic: (shareLink) => api.get(`/forms/public/${shareLink}`),
  submit: (id, data) => api.post(`/forms/${id}/submit`, data),
};

// Form Folders
export const formFolders = {
  list: () => api.get('/forms/folders/list'),
  create: (data) => api.post('/forms/folders/create', data),
  update: (id, data) => api.patch(`/forms/folders/${id}`, data),
  delete: (id) => api.delete(`/forms/folders/${id}`),
};

// Form Responses
export const formResponses = {
  list: (formId) => api.get(`/forms/${formId}/responses`),
  get: (formId, responseId) => api.get(`/forms/${formId}/responses/${responseId}`),
  delete: (formId, responseId) => api.delete(`/forms/${formId}/responses/${responseId}`),
  exportCSV: (formId) => api.get(`/forms/${formId}/responses/export/csv`),
  exportXLSX: (formId) => api.get(`/forms/${formId}/responses/export/xlsx`),
  exportPDF: (formId) => api.get(`/forms/${formId}/responses/export/pdf`),
};

// Form Analytics
export const formAnalytics = {
  get: (formId) => api.get(`/forms/${formId}/analytics`),
};

// Form Templates
export const formTemplates = {
  list: (params) => api.get('/forms/templates/list', { params }),
  get: (id) => api.get(`/forms/templates/${id}`),
};

// ============================================
// Phase 2AK: Cloud Storage
// ============================================

// File Upload
export const storageUpload = {
  init: (data) => api.post('/storage/upload/init', data),
  complete: (data) => api.post('/storage/upload/complete', data),
};

// Files
export const storageFiles = {
  list: (params) => api.get('/storage/files', { params }),
  get: (id) => api.get(`/storage/files/${id}`),
  download: (id) => api.get(`/storage/files/${id}/download`),
  update: (id, data) => api.patch(`/storage/files/${id}`, data),
  delete: (id) => api.delete(`/storage/files/${id}`),
  star: (id) => api.post(`/storage/files/${id}/star`),
  unstar: (id) => api.post(`/storage/files/${id}/unstar`),
  copy: (id) => api.post(`/storage/files/${id}/copy`),
  versions: (id) => api.get(`/storage/files/${id}/versions`),
  restoreVersion: (id, versionId) => api.post(`/storage/files/${id}/restore-version/${versionId}`),
};

// Folders
export const storageFolders = {
  list: () => api.get('/storage/folders'),
  get: (id) => api.get(`/storage/folders/${id}`),
  create: (data) => api.post('/storage/folders', data),
  update: (id, data) => api.patch(`/storage/folders/${id}`, data),
  delete: (id) => api.delete(`/storage/folders/${id}`),
};

// Sharing
export const storageSharing = {
  create: (data) => api.post('/storage/share', data),
  getSharedWithMe: () => api.get('/storage/shared-with-me'),
  update: (id, data) => api.patch(`/storage/shares/${id}`, data),
  delete: (id) => api.delete(`/storage/shares/${id}`),
};

// Trash
export const storageTrash = {
  list: () => api.get('/storage/trash'),
  restore: (type, id) => api.post(`/storage/trash/${type}/${id}/restore`),
  deletePermanently: (type, id) => api.delete(`/storage/trash/${type}/${id}`),
  empty: () => api.delete('/storage/trash/empty'),
};

// Search
export const storageSearch = {
  search: (params) => api.get('/storage/search', { params }),
};

// Quota
export const storageQuota = {
  get: () => api.get('/storage/quota'),
  calculate: () => api.post('/storage/quota/calculate'),
};

// Recent & Starred
export const storageRecent = {
  recent: () => api.get('/storage/recent'),
  starred: () => api.get('/storage/starred'),
};

// ============================================================================
// Phase 2AL - Social Media Platform
// ============================================================================

// Profile
export const socialProfile = {
  get: () => api.get('/social/profile'),
  getUser: (userId) => api.get(`/social/profile/${userId}`),
  update: (data) => api.patch('/social/profile', data),
  follow: (userId) => api.post(`/social/follow/${userId}`),
  unfollow: (userId) => api.delete(`/social/follow/${userId}`),
  getFollowers: (userId, params) => api.get(`/social/followers/${userId}`, { params }),
  getFollowing: (userId, params) => api.get(`/social/following/${userId}`, { params }),
};

// Feed & Posts
export const socialPosts = {
  getFeed: (params) => api.get('/social/feed', { params }),
  create: (data) => api.post('/social/posts', data),
  get: (postId) => api.get(`/social/posts/${postId}`),
  getUserPosts: (userId, params) => api.get(`/social/posts/user/${userId}`, { params }),
  update: (postId, data) => api.patch(`/social/posts/${postId}`, data),
  delete: (postId) => api.delete(`/social/posts/${postId}`),
  like: (postId, data) => api.post(`/social/posts/${postId}/like`, data),
  unlike: (postId) => api.delete(`/social/posts/${postId}/like`),
  share: (postId, data) => api.post(`/social/posts/${postId}/share`, data),
};

// Comments
export const socialComments = {
  create: (postId, data) => api.post(`/social/posts/${postId}/comments`, data),
  get: (postId, params) => api.get(`/social/posts/${postId}/comments`, { params }),
  update: (commentId, data) => api.patch(`/social/comments/${commentId}`, data),
  delete: (commentId) => api.delete(`/social/comments/${commentId}`),
  like: (commentId) => api.post(`/social/comments/${commentId}/like`),
  unlike: (commentId) => api.delete(`/social/comments/${commentId}/like`),
};

// Stories
export const socialStories = {
  create: (data) => api.post('/social/stories', data),
  get: () => api.get('/social/stories'),
  view: (storyId) => api.post(`/social/stories/${storyId}/view`),
};

// Groups
export const socialGroups = {
  create: (data) => api.post('/social/groups', data),
  list: (params) => api.get('/social/groups', { params }),
  join: (groupId) => api.post(`/social/groups/${groupId}/join`),
  leave: (groupId) => api.delete(`/social/groups/${groupId}/leave`),
  createPost: (groupId, data) => api.post(`/social/groups/${groupId}/posts`, data),
};

// Notifications
export const socialNotifications = {
  get: (params) => api.get('/social/notifications', { params }),
  markAsRead: (notificationId) => api.patch(`/social/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/social/notifications/read-all'),
};

// Search
export const socialSearch = {
  users: (params) => api.get('/social/search/users', { params }),
  posts: (params) => api.get('/social/search/posts', { params }),
};

// ============================================================================
// Phase 2AM - Video Platform
// ============================================================================

// Channels
export const videoChannels = {
  create: (data) => api.post('/videos/channels', data),
  get: (handle) => api.get(`/videos/channels/${handle}`),
  getOwn: () => api.get('/videos/channels/me/info'),
  update: (id, data) => api.patch(`/videos/channels/${id}`, data),
  subscribe: (id, data) => api.post(`/videos/channels/${id}/subscribe`, data),
  unsubscribe: (id) => api.delete(`/videos/channels/${id}/unsubscribe`),
  getPlaylists: (id, params) => api.get(`/videos/channels/${id}/playlists`, { params }),
};

// Subscriptions
export const videoSubscriptions = {
  list: (params) => api.get('/videos/subscriptions', { params }),
};

// Videos
export const videos = {
  uploadInit: (data) => api.post('/videos/upload/init', data),
  publish: (id) => api.post(`/videos/videos/${id}/publish`),
  list: (params) => api.get('/videos/videos', { params }),
  get: (id) => api.get(`/videos/videos/${id}`),
  update: (id, data) => api.patch(`/videos/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/videos/${id}`),
  like: (id, data) => api.post(`/videos/videos/${id}/like`, data),
  unlike: (id) => api.delete(`/videos/videos/${id}/like`),
  view: (id, data) => api.post(`/videos/videos/${id}/view`, data),
};

// Comments
export const videoComments = {
  add: (videoId, data) => api.post(`/videos/videos/${videoId}/comments`, data),
  list: (videoId, params) => api.get(`/videos/videos/${videoId}/comments`, { params }),
  delete: (id) => api.delete(`/videos/comments/${id}`),
};

// Playlists
export const videoPlaylists = {
  create: (data) => api.post('/videos/playlists', data),
  get: (id) => api.get(`/videos/playlists/${id}`),
  addVideo: (id, data) => api.post(`/videos/playlists/${id}/add`, data),
  removeVideo: (id, videoId) => api.delete(`/videos/playlists/${id}/remove/${videoId}`),
};

// Discovery
export const videoDiscovery = {
  search: (params) => api.get('/videos/search', { params }),
  recommendations: (params) => api.get('/videos/recommendations', { params }),
  trending: (params) => api.get('/videos/trending', { params }),
  shorts: (params) => api.get('/videos/shorts', { params }),
};

// Analytics
export const videoAnalytics = {
  channel: (id) => api.get(`/videos/analytics/channel/${id}`),
  video: (id) => api.get(`/videos/analytics/video/${id}`),
};

export default api;
