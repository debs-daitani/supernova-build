import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import supernovaRoutes from './routes/supernova.js';
import paymentRoutes from './routes/payments.js';
import marketplaceRoutes from './routes/marketplace.js';
import communityRoutes from './routes/community.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import contentRoutes from './routes/content.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';

// Phase 2D - User Empowerment Tools
import quizzesRoutes from './routes/quizzes.js';
import linksPagesRoutes from './routes/linksPages.js';
import shortLinksRoutes from './routes/shortLinks.js';
import brandHubRoutes from './routes/brandHub.js';

// Phase 2F - Chatbot Builder
import chatbotsRoutes from './routes/chatbots.js';
import chatWidgetRoutes from './routes/chat.js';

// Phase 2F Addendum - Social Media Automation
import socialRoutes from './routes/social.js';
import webhooksRoutes from './routes/webhooks.js';

// Phase 2G - Website Builder
import websitesRoutes from './routes/websites.js';
import siteRoutes from './routes/site.js';

// Phase 2Q + 2R - AI Generation (Image & Video)
import aiImagesRoutes from './routes/ai-images.js';
import aiVideosRoutes from './routes/ai-videos.js';

// Phase 2H - CRM + Accounting
import crmRoutes from './routes/crm.js';
import accountingRoutes from './routes/accounting.js';

// Phase 2I - E-Commerce Shop
import shopRoutes from './routes/shop.js';

// Phase 2P - Task & Project Management
import tasksRoutes from './routes/tasks.js';

// Phase 2E - Content Creation Suite
import contentCreationRoutes from './routes/contentCreation.js';

// Phase 2M - Video Tools Suite
import videoRoutes from './routes/video.js';

// Phase 2N - AI Content Generator
import contentAIRoutes from './routes/content-ai.js';

// Phase 2AS - Messaging Platform
import platformMessagesRoutes from './routes/platformMessages.js';

// Phase 2J - Events Platform
import eventsRoutes from './routes/events.js';

// Phase 2O - Legal Templates + Launch Toolkit
import legalRoutes from './routes/legal.js';
import launchRoutes from './routes/launch.js';

// Phase 2AC - Image Editor
import imageEditorRoutes from './routes/image-editor.js';

// Phase 2AE - Video Editor
import videoEditorRoutes from './routes/video-editor.js';

// Phase 2AF - PDF Editor
import pdfEditorRoutes from './routes/pdf-editor.js';

// Phase 2AG - Document Editor
import docsRoutes from './routes/docs.js';

// Phase 2AH - Spreadsheet Editor
import sheetsRoutes from './routes/sheets.js';

// Phase 2AI - Presentation Editor
import presentationsRoutes from './routes/presentations.js';

// Phase 2AJ - Forms Builder
import formsRoutes from './routes/forms.js';

// Phase 2AK - Cloud Storage
import storageRoutes from './routes/storage.js';

// Phase 2AM - Video Platform
import videosRoutes from './routes/videos.js';

// Phase 2AN - Microblogging Platform
import microRoutes from './routes/micro.js';

// Phase 2AT - Demo Video & Screen Recording
import demosRoutes from './routes/demos.js';

// Phase 2AU - Launch Assets & Comparisons
import comparisonsRoutes from './routes/comparisons.js';

// Phase 2AV - Testimonial Collection System
import testimonialsRoutes from './routes/testimonials.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/supernova', supernovaRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Phase 2D - User Empowerment Tools
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/links-page', linksPagesRoutes);
app.use('/api/short-links', shortLinksRoutes);
app.use('/api/brand-hub', brandHubRoutes);

// Phase 2F - Chatbot Builder
app.use('/api/chatbots', chatbotsRoutes);
app.use('/api/chat', chatWidgetRoutes); // Public widget API

// Phase 2F Addendum - Social Media Automation
app.use('/api/social', socialRoutes);
app.use('/api/webhooks', webhooksRoutes); // Meta webhooks (no auth)

// Phase 2G - Website Builder
app.use('/api/websites', websitesRoutes);
app.use('/site', siteRoutes); // Public website hosting

// Phase 2Q + 2R - AI Generation
app.use('/api/ai', aiImagesRoutes);
app.use('/api/ai', aiVideosRoutes);

// Phase 2H - CRM + Accounting
app.use('/api/crm', crmRoutes);
app.use('/api/accounting', accountingRoutes);

// Phase 2I - E-Commerce Shop
app.use('/api/shop', shopRoutes);

// Phase 2P - Task & Project Management
app.use('/api/tasks', tasksRoutes);

// Phase 2E - Content Creation Suite
app.use('/api/content-creation', contentCreationRoutes);

// Phase 2M - Video Tools Suite
app.use('/api/video', videoRoutes);

// Phase 2N - AI Content Generator
app.use('/api/content-ai', contentAIRoutes);

// Phase 2AS - Messaging Platform
app.use('/api/platform-messages', platformMessagesRoutes);

// Phase 2J - Events Platform
app.use('/api', eventsRoutes);

// Phase 2O - Legal Templates + Launch Toolkit
app.use('/api/legal', legalRoutes);
app.use('/api', launchRoutes);

// Phase 2AC - Image Editor
app.use('/api/image-editor', imageEditorRoutes);

// Phase 2AE - Video Editor
app.use('/api/video-editor', videoEditorRoutes);

// Phase 2AF - PDF Editor
app.use('/api/pdf-editor', pdfEditorRoutes);

// Phase 2AG - Document Editor
app.use('/api/docs', docsRoutes);

// Phase 2AH - Spreadsheet Editor
app.use('/api/sheets', sheetsRoutes);

// Phase 2AI - Presentation Editor
app.use('/api/presentations', presentationsRoutes);

// Phase 2AJ - Forms Builder
app.use('/api/forms', formsRoutes);

// Phase 2AK - Cloud Storage
app.use('/api/storage', storageRoutes);

// Phase 2AM - Video Platform
app.use('/api/videos', videosRoutes);

// Phase 2AN - Microblogging Platform
app.use('/api/micro', microRoutes);

// Phase 2AT - Demo Video & Screen Recording
app.use('/api/demos', demosRoutes);

// Phase 2AU - Launch Assets & Comparisons
app.use('/api/comparisons', comparisonsRoutes);

// Phase 2AV - Testimonial Collection System
app.use('/api/testimonials', testimonialsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
});

export default app;
