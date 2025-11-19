import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// PUBLIC ROUTES - Demo Videos
// ============================================

// Get all published demo videos
router.get('/videos', async (req, res) => {
  try {
    const {
      category,
      videoType,
      featured,
      limit = 20,
      offset = 0
    } = req.query;

    const where = { isPublished: true };

    if (category) where.category = category;
    if (videoType) where.videoType = videoType;
    if (featured === 'true') where.featured = true;

    const videos = await prisma.demoVideo.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { publishedAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset),
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        videoType: true,
        category: true,
        featured: true,
        viewCount: true,
        avgWatchTime: true,
        completionRate: true,
        publishedAt: true,
        // Don't include chapters/ctas in list view
      }
    });

    const total = await prisma.demoVideo.count({ where });

    res.json({
      videos,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching demo videos:', error);
    res.status(500).json({ error: 'Failed to fetch demo videos' });
  }
});

// Get single demo video with full details
router.get('/videos/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.demoVideo.findUnique({
      where: { id },
      include: {
        views: {
          where: req.user ? { userId: req.user.id } : {},
          orderBy: { viewedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Demo video not found' });
    }

    if (!video.isPublished && (!req.user || !req.user.isAdmin)) {
      return res.status(404).json({ error: 'Demo video not found' });
    }

    // Get user's last watch position if authenticated
    const lastView = video.views[0];
    const userWatchPosition = lastView ? lastView.dropOffAt || (lastView.completed ? video.duration : 0) : 0;

    res.json({
      ...video,
      views: undefined, // Remove views array from response
      userWatchPosition
    });
  } catch (error) {
    console.error('Error fetching demo video:', error);
    res.status(500).json({ error: 'Failed to fetch demo video' });
  }
});

// Log video view
router.post('/videos/:id/view', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { watchTime, completed, dropOffAt, referrer } = req.body;

    const video = await prisma.demoVideo.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Demo video not found' });
    }

    // Create view record
    const view = await prisma.demoVideoView.create({
      data: {
        videoId: id,
        userId: req.user?.id,
        watchTime: parseInt(watchTime) || 0,
        completed: completed || false,
        dropOffAt: dropOffAt ? parseInt(dropOffAt) : null,
        referrer: referrer || req.headers.referer
      }
    });

    // Update video stats
    const views = await prisma.demoVideoView.findMany({
      where: { videoId: id }
    });

    const totalWatchTime = views.reduce((sum, v) => sum + v.watchTime, 0);
    const avgWatchTime = Math.round(totalWatchTime / views.length);
    const completedCount = views.filter(v => v.completed).length;
    const completionRate = (completedCount / views.length) * 100;

    await prisma.demoVideo.update({
      where: { id },
      data: {
        viewCount: views.length,
        avgWatchTime,
        completionRate
      }
    });

    res.json({ success: true, view });
  } catch (error) {
    console.error('Error logging video view:', error);
    res.status(500).json({ error: 'Failed to log video view' });
  }
});

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================

// Upload screen recording
router.post('/recordings', authenticate, async (req, res) => {
  try {
    const {
      title,
      videoUrl,
      thumbnailUrl,
      duration,
      recordingType,
      includeAudio,
      includeCursor
    } = req.body;

    if (!videoUrl || !duration || !recordingType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recording = await prisma.screenRecording.create({
      data: {
        userId: req.user.id,
        title,
        videoUrl,
        thumbnailUrl,
        duration: parseInt(duration),
        recordingType,
        includeAudio: includeAudio || false,
        includeCursor: includeCursor || true
      }
    });

    res.json(recording);
  } catch (error) {
    console.error('Error creating screen recording:', error);
    res.status(500).json({ error: 'Failed to create screen recording' });
  }
});

// Get user's screen recordings
router.get('/recordings', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const recordings = await prisma.screenRecording.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.screenRecording.count({
      where: { userId: req.user.id }
    });

    res.json({
      recordings,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

// Delete screen recording
router.delete('/recordings/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const recording = await prisma.screenRecording.findUnique({
      where: { id }
    });

    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    if (recording.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.screenRecording.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ error: 'Failed to delete recording' });
  }
});

// Submit video testimonial
router.post('/testimonials', authenticate, async (req, res) => {
  try {
    const {
      videoUrl,
      thumbnailUrl,
      duration,
      quote
    } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const testimonial = await prisma.videoTestimonial.create({
      data: {
        userId: req.user.id,
        videoUrl,
        thumbnailUrl,
        duration: duration ? parseInt(duration) : null,
        quote,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ error: 'Failed to submit testimonial' });
  }
});

// Get user's testimonials
router.get('/testimonials/my', authenticate, async (req, res) => {
  try {
    const testimonials = await prisma.videoTestimonial.findMany({
      where: { userId: req.user.id },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Get approved testimonials (public)
router.get('/testimonials', async (req, res) => {
  try {
    const { featured, limit = 10 } = req.query;

    const where = { status: 'approved' };
    if (featured === 'true') where.featured = true;

    const testimonials = await prisma.videoTestimonial.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { submittedAt: 'desc' }
      ],
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            niche: true
          }
        }
      }
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Create demo video
router.post('/videos', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      videoType,
      category,
      chapters,
      ctas,
      featured,
      order,
      isPublished,
      metaTitle,
      metaDescription
    } = req.body;

    if (!title || !videoUrl || !thumbnailUrl || !duration || !videoType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const video = await prisma.demoVideo.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration: parseInt(duration),
        videoType,
        category,
        chapters,
        ctas,
        featured: featured || false,
        order: order || 0,
        isPublished: isPublished || false,
        metaTitle,
        metaDescription,
        publishedAt: isPublished ? new Date() : null
      }
    });

    res.json(video);
  } catch (error) {
    console.error('Error creating demo video:', error);
    res.status(500).json({ error: 'Failed to create demo video' });
  }
});

// Update demo video
router.patch('/videos/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle publishing
    if (updateData.isPublished === true) {
      const existingVideo = await prisma.demoVideo.findUnique({
        where: { id },
        select: { publishedAt: true }
      });

      if (!existingVideo.publishedAt) {
        updateData.publishedAt = new Date();
      }
    } else if (updateData.isPublished === false) {
      updateData.publishedAt = null;
    }

    const video = await prisma.demoVideo.update({
      where: { id },
      data: updateData
    });

    res.json(video);
  } catch (error) {
    console.error('Error updating demo video:', error);
    res.status(500).json({ error: 'Failed to update demo video' });
  }
});

// Delete demo video
router.delete('/videos/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.demoVideo.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting demo video:', error);
    res.status(500).json({ error: 'Failed to delete demo video' });
  }
});

// Get all demo videos (including unpublished) for admin
router.get('/admin/videos', authenticate, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const videos = await prisma.demoVideo.findMany({
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        _count: {
          select: { views: true }
        }
      }
    });

    const total = await prisma.demoVideo.count();

    res.json({
      videos,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get video analytics
router.get('/analytics/:videoId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await prisma.demoVideo.findUnique({
      where: { id: videoId },
      include: {
        views: {
          orderBy: { viewedAt: 'desc' }
        }
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Calculate drop-off points
    const dropOffPoints = {};
    video.views.forEach(view => {
      if (view.dropOffAt) {
        const bucket = Math.floor(view.dropOffAt / 10) * 10; // 10-second buckets
        dropOffPoints[bucket] = (dropOffPoints[bucket] || 0) + 1;
      }
    });

    // CTA click tracking would require additional implementation
    const analytics = {
      video: {
        id: video.id,
        title: video.title,
        duration: video.duration
      },
      totalViews: video.viewCount,
      uniqueViewers: await prisma.demoVideoView.count({
        where: { videoId, userId: { not: null } },
        distinct: ['userId']
      }),
      avgWatchTime: video.avgWatchTime,
      completionRate: video.completionRate,
      dropOffPoints,
      recentViews: video.views.slice(0, 20)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get pending testimonials
router.get('/admin/testimonials', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const testimonials = await prisma.videoTestimonial.findMany({
      where: status === 'all' ? {} : { status },
      orderBy: { submittedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            niche: true
          }
        }
      }
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Approve/reject testimonial
router.patch('/testimonials/:id/review', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, featured, displayOnHome } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const testimonial = await prisma.videoTestimonial.update({
      where: { id },
      data: {
        status,
        featured: featured || false,
        displayOnHome: displayOnHome || false,
        reviewedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Error reviewing testimonial:', error);
    res.status(500).json({ error: 'Failed to review testimonial' });
  }
});

export default router;
