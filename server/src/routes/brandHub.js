import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/brand-hub - Create or update brand hub
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      username,
      headline,
      tagline,
      coverImage,
      about,
      services,
      portfolio,
      testimonials,
      contactEmail,
      contactPhone,
      calendlyLink,
      theme,
      primaryColor,
      published,
    } = req.body;

    const brandHub = await prisma.brandHub.upsert({
      where: { userId: req.user.id },
      update: {
        username,
        headline,
        tagline,
        coverImage,
        about,
        services,
        portfolio,
        testimonials,
        contactEmail,
        contactPhone,
        calendlyLink,
        theme,
        primaryColor,
        published,
      },
      create: {
        userId: req.user.id,
        username,
        headline,
        tagline,
        coverImage,
        about,
        services,
        portfolio,
        testimonials,
        contactEmail,
        contactPhone,
        calendlyLink,
        theme: theme || 'professional',
        primaryColor: primaryColor || '#FF1493',
        published: published || false,
      },
    });

    res.json(brandHub);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username already taken' });
    }
    console.error('Create brand hub error:', error);
    res.status(500).json({ error: 'Failed to create brand hub' });
  }
});

// GET /api/brand-hub - Get user's brand hub
router.get('/', authenticateToken, async (req, res) => {
  try {
    const brandHub = await prisma.brandHub.findUnique({
      where: { userId: req.user.id },
    });

    res.json(brandHub);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brand hub' });
  }
});

// GET /api/brand-hub/u/:username - Get brand hub by username (PUBLIC)
router.get('/u/:username', async (req, res) => {
  try {
    const brandHub = await prisma.brandHub.findUnique({
      where: { username: req.params.username, published: true },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!brandHub) {
      return res.status(404).json({ error: 'Brand hub not found' });
    }

    // Increment view count
    await prisma.brandHub.update({
      where: { id: brandHub.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(brandHub);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brand hub' });
  }
});

export default router;
