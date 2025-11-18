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
