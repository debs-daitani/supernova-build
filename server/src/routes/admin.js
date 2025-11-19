import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateContent } from '../utils/validators.js';

const router = express.Router();

// All routes require admin access
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      freeUsers,
      upgradeUsers,
      memberUsers,
      totalConversations,
      totalMessages,
      totalListings,
      totalPosts,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountType: 'FREE' } }),
      prisma.user.count({ where: { accountType: 'UPGRADE' } }),
      prisma.user.count({ where: { accountType: 'MEMBER' } }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.marketplaceListing.count(),
      prisma.forumPost.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED' },
      }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        upgrade: upgradeUsers,
        member: memberUsers,
      },
      engagement: {
        conversations: totalConversations,
        messages: totalMessages,
        listings: totalListings,
        posts: totalPosts,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, accountType, limit = 50, offset = 0 } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (accountType) {
      where.accountType = accountType;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          accountType: true,
          isAdmin: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              conversations: true,
              messages: true,
              listings: true,
            },
          },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/content - Create content
router.post('/content', validateContent, async (req, res) => {
  try {
    const {
      title,
      description,
      contentType,
      pillar,
      tags,
      accessLevel,
      url,
      fileUrl,
      textContent,
      orderIndex,
    } = req.body;

    const content = await prisma.content.create({
      data: {
        title,
        description,
        contentType,
        pillar,
        tags: tags || [],
        accessLevel,
        url,
        fileUrl,
        textContent,
        orderIndex: orderIndex || 0,
      },
    });

    res.status(201).json(content);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// GET /api/admin/content
router.get('/content', async (req, res) => {
  try {
    const { pillar, contentType, search, limit = 50, offset = 0 } = req.query;

    const where = {};

    if (pillar) {
      where.pillar = pillar;
    }

    if (contentType) {
      where.contentType = contentType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.content.count({ where }),
    ]);

    res.json({ content, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// PATCH /api/admin/content/:id
router.patch('/content/:id', async (req, res) => {
  try {
    const updated = await prisma.content.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// DELETE /api/admin/content/:id
router.delete('/content/:id', async (req, res) => {
  try {
    await prisma.content.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// POST /api/admin/forum-categories - Create forum category
router.post('/forum-categories', async (req, res) => {
  try {
    const { name, description, icon, slug, orderIndex } = req.body;

    const category = await prisma.forumCategory.create({
      data: {
        name,
        description,
        icon,
        slug,
        orderIndex: orderIndex || 0,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET /api/admin/analytics - Analytics data
router.get('/analytics', async (req, res) => {
  try {
    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // Get revenue by day (last 30 days)
    const revenueByDay = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'SUCCEEDED',
      },
      _sum: { amount: true },
    });

    res.json({
      userGrowth,
      revenueByDay,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
