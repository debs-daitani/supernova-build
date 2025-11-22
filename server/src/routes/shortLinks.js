import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate random short code
const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

// POST /api/short-links - Create short link
router.post('/', authenticate, async (req, res) => {
  try {
    const { originalUrl, title, customCode, expiresAt } = req.body;

    let shortCode = customCode || generateShortCode();

    // Check if custom code is available
    if (customCode) {
      const existing = await prisma.shortLink.findUnique({
        where: { shortCode: customCode },
      });

      if (existing) {
        return res.status(400).json({ error: 'Short code already taken' });
      }
    }

    const shortLink = await prisma.shortLink.create({
      data: {
        userId: req.user.id,
        shortCode,
        originalUrl,
        title,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json(shortLink);
  } catch (error) {
    console.error('Create short link error:', error);
    res.status(500).json({ error: 'Failed to create short link' });
  }
});

// GET /api/short-links - Get user's short links
router.get('/', authenticate, async (req, res) => {
  try {
    const shortLinks = await prisma.shortLink.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(shortLinks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch short links' });
  }
});

// GET /api/short-links/:id - Get specific link
router.get('/:id', authenticate, async (req, res) => {
  try {
    const shortLink = await prisma.shortLink.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!shortLink) {
      return res.status(404).json({ error: 'Short link not found' });
    }

    res.json(shortLink);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch short link' });
  }
});

// PATCH /api/short-links/:id - Update link
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const updated = await prisma.shortLink.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: req.body,
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Short link not found' });
    }

    const link = await prisma.shortLink.findUnique({
      where: { id: req.params.id },
    });

    res.json(link);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update short link' });
  }
});

// DELETE /api/short-links/:id - Delete link
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.shortLink.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({ message: 'Short link deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete short link' });
  }
});

// GET /api/short-links/:shortCode/analytics - Get link analytics
router.get('/:shortCode/analytics', authenticate, async (req, res) => {
  try {
    const shortLink = await prisma.shortLink.findFirst({
      where: {
        shortCode: req.params.shortCode,
        userId: req.user.id,
      },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!shortLink) {
      return res.status(404).json({ error: 'Short link not found' });
    }

    res.json(shortLink);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /s/:shortCode - Redirect short link (PUBLIC)
router.get('/s/:shortCode', async (req, res) => {
  try {
    const shortLink = await prisma.shortLink.findUnique({
      where: { shortCode: req.params.shortCode },
    });

    if (!shortLink || !shortLink.active) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check expiration
    if (shortLink.expiresAt && new Date() > shortLink.expiresAt) {
      return res.status(410).json({ error: 'Link expired' });
    }

    // Log click
    await prisma.shortLinkClick.create({
      data: {
        shortLinkId: shortLink.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
      },
    });

    // Increment click count
    await prisma.shortLink.update({
      where: { id: shortLink.id },
      data: { clickCount: { increment: 1 } },
    });

    // Redirect
    res.redirect(302, shortLink.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Redirect failed' });
  }
});

export default router;
