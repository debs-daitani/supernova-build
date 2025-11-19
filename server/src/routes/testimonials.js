import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get approved testimonials
router.get('/', async (req, res) => {
  try {
    const {
      category,
      featured,
      minRating,
      limit = 20,
      offset = 0
    } = req.query;

    const where = { status: 'approved' };

    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (minRating) where.rating = { gte: parseInt(minRating) };

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { submittedAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset),
      select: {
        id: true,
        content: true,
        rating: true,
        photoUrl: true,
        videoUrl: true,
        videoThumbnail: true,
        authorName: true,
        authorRole: true,
        authorCompany: true,
        authorPhoto: true,
        useCase: true,
        category: true,
        featured: true,
        submittedAt: true
      }
    });

    const total = await prisma.testimonial.count({ where });

    res.json({
      testimonials,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Get featured testimonials
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const testimonials = await prisma.testimonial.findMany({
      where: {
        status: 'approved',
        featured: true
      },
      orderBy: [
        { order: 'asc' },
        { submittedAt: 'desc' }
      ],
      take: parseInt(limit),
      select: {
        id: true,
        content: true,
        rating: true,
        authorName: true,
        authorRole: true,
        authorCompany: true,
        authorPhoto: true,
        category: true
      }
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch featured testimonials' });
  }
});

// Get testimonial stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.testimonial.aggregate({
      where: { status: 'approved' },
      _count: true,
      _avg: {
        rating: true
      }
    });

    const fiveStarCount = await prisma.testimonial.count({
      where: {
        status: 'approved',
        rating: 5
      }
    });

    res.json({
      totalCount: stats._count,
      averageRating: stats._avg.rating || 0,
      fiveStarCount,
      recommendationRate: stats._count > 0 ? (fiveStarCount / stats._count * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Submit testimonial
router.post('/submit', authenticate, async (req, res) => {
  try {
    const {
      content,
      rating,
      photoUrl,
      videoUrl,
      videoThumbnail,
      authorName,
      authorRole,
      authorCompany,
      authorPhoto,
      useCase,
      category,
      source
    } = req.body;

    if (!content || !authorName) {
      return res.status(400).json({ error: 'Content and author name are required' });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        userId: req.user.id,
        content,
        rating: rating ? parseInt(rating) : null,
        photoUrl,
        videoUrl,
        videoThumbnail,
        authorName,
        authorRole,
        authorCompany,
        authorPhoto: authorPhoto || req.user.avatar,
        useCase,
        category,
        source: source || 'customer',
        status: 'pending'
      }
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ error: 'Failed to submit testimonial' });
  }
});

// ============================================
// USER ROUTES
// ============================================

// Get user's testimonials
router.get('/my-testimonials', authenticate, async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { userId: req.user.id },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching user testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Update own testimonial (if pending)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });

    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    if (testimonial.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (testimonial.status !== 'pending') {
      return res.status(400).json({ error: 'Can only edit pending testimonials' });
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get pending testimonials
router.get('/admin/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'pending' },
      orderBy: { submittedAt: 'asc' },
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

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching pending testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Get all testimonials (admin)
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { submittedAt: 'desc' }
      ],
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

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Approve testimonial
router.patch('/admin/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured, displayOnHome, category, order } = req.body;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        status: 'approved',
        featured: featured || false,
        displayOnHome: displayOnHome || false,
        category,
        order: order || 0,
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({ error: 'Failed to approve testimonial' });
  }
});

// Feature testimonial
router.patch('/admin/:id/feature', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured, displayOnHome } = req.body;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        featured: featured !== undefined ? featured : true,
        displayOnHome: displayOnHome || false,
        status: 'approved' // Auto-approve when featuring
      }
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Error featuring testimonial:', error);
    res.status(500).json({ error: 'Failed to feature testimonial' });
  }
});

// Reject testimonial
router.patch('/admin/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      }
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Error rejecting testimonial:', error);
    res.status(500).json({ error: 'Failed to reject testimonial' });
  }
});

// Delete testimonial
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.testimonial.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Send testimonial request
router.post('/admin/request', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, requestType } = req.body;

    if (!userId || !requestType) {
      return res.status(400).json({ error: 'User ID and request type are required' });
    }

    const request = await prisma.testimonialRequest.create({
      data: {
        userId,
        requestType
      }
    });

    // TODO: Send email/notification based on requestType

    res.json(request);
  } catch (error) {
    console.error('Error sending testimonial request:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Get testimonial requests
router.get('/admin/requests', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const requests = await prisma.testimonialRequest.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        testimonial: true
      }
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ============================================
// WIDGET ROUTES
// ============================================

// Create widget
router.post('/widgets', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      widgetType,
      category,
      featuredOnly,
      minRating,
      showPhoto,
      showRating,
      showRole,
      maxItems,
      theme,
      customCSS
    } = req.body;

    if (!name || !widgetType) {
      return res.status(400).json({ error: 'Name and widget type are required' });
    }

    const widget = await prisma.testimonialWidget.create({
      data: {
        name,
        widgetType,
        category,
        featuredOnly: featuredOnly || false,
        minRating: minRating ? parseInt(minRating) : null,
        showPhoto: showPhoto !== false,
        showRating: showRating !== false,
        showRole: showRole !== false,
        maxItems: maxItems ? parseInt(maxItems) : 3,
        theme: theme || 'light',
        customCSS
      }
    });

    res.json(widget);
  } catch (error) {
    console.error('Error creating widget:', error);
    res.status(500).json({ error: 'Failed to create widget' });
  }
});

// Get widget config
router.get('/widgets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const widget = await prisma.testimonialWidget.findUnique({
      where: { id }
    });

    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    res.json(widget);
  } catch (error) {
    console.error('Error fetching widget:', error);
    res.status(500).json({ error: 'Failed to fetch widget' });
  }
});

// Get testimonials for widget
router.get('/widgets/:id/render', async (req, res) => {
  try {
    const { id } = req.params;

    const widget = await prisma.testimonialWidget.findUnique({
      where: { id }
    });

    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    const where = { status: 'approved' };

    if (widget.category) where.category = widget.category;
    if (widget.featuredOnly) where.featured = true;
    if (widget.minRating) where.rating = { gte: widget.minRating };

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { submittedAt: 'desc' }
      ],
      take: widget.maxItems,
      select: {
        id: true,
        content: true,
        rating: widget.showRating ? true : undefined,
        photoUrl: widget.showPhoto ? true : undefined,
        authorName: true,
        authorRole: widget.showRole ? true : undefined,
        authorCompany: widget.showRole ? true : undefined,
        authorPhoto: widget.showPhoto ? true : undefined
      }
    });

    res.json({
      widget,
      testimonials
    });
  } catch (error) {
    console.error('Error rendering widget:', error);
    res.status(500).json({ error: 'Failed to render widget' });
  }
});

export default router;
