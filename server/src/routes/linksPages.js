import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/links-page - Create or update links page
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { username, displayName, bio, avatar, theme, backgroundColor, textColor, accentColor, published } = req.body;

    const linksPage = await prisma.userLinksPage.upsert({
      where: { userId: req.user.id },
      update: {
        username,
        displayName,
        bio,
        avatar,
        theme,
        backgroundColor,
        textColor,
        accentColor,
        published,
      },
      create: {
        userId: req.user.id,
        username,
        displayName,
        bio,
        avatar,
        theme: theme || 'default',
        backgroundColor: backgroundColor || '#FFFFFF',
        textColor: textColor || '#333333',
        accentColor: accentColor || '#FF1493',
        published: published || false,
      },
    });

    res.json(linksPage);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username already taken' });
    }
    console.error('Create links page error:', error);
    res.status(500).json({ error: 'Failed to create links page' });
  }
});

// GET /api/links-page - Get user's links page
router.get('/', authenticateToken, async (req, res) => {
  try {
    const linksPage = await prisma.userLinksPage.findUnique({
      where: { userId: req.user.id },
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(linksPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch links page' });
  }
});

// GET /api/links-page/@:username - Get links page by username (PUBLIC)
router.get('/@:username', async (req, res) => {
  try {
    const linksPage = await prisma.userLinksPage.findUnique({
      where: { username: req.params.username, published: true },
      include: {
        links: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!linksPage) {
      return res.status(404).json({ error: 'Links page not found' });
    }

    // Increment view count
    await prisma.userLinksPage.update({
      where: { id: linksPage.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(linksPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch links page' });
  }
});

// POST /api/links-page/links - Add link
router.post('/links', authenticateToken, async (req, res) => {
  try {
    const linksPage = await prisma.userLinksPage.findUnique({
      where: { userId: req.user.id },
    });

    if (!linksPage) {
      return res.status(404).json({ error: 'Links page not found. Create one first.' });
    }

    const { title, url, icon } = req.body;

    // Get next order
    const maxOrder = await prisma.userLink.aggregate({
      where: { linksPageId: linksPage.id },
      _max: { order: true },
    });

    const link = await prisma.userLink.create({
      data: {
        linksPageId: linksPage.id,
        title,
        url,
        icon,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Add link error:', error);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

// PATCH /api/links-page/links/:id - Update link
router.patch('/links/:id', authenticateToken, async (req, res) => {
  try {
    const link = await prisma.userLink.findFirst({
      where: { id: req.params.id },
      include: { linksPage: true },
    });

    if (!link || link.linksPage.userId !== req.user.id) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const updated = await prisma.userLink.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// DELETE /api/links-page/links/:id - Delete link
router.delete('/links/:id', authenticateToken, async (req, res) => {
  try {
    const link = await prisma.userLink.findFirst({
      where: { id: req.params.id },
      include: { linksPage: true },
    });

    if (!link || link.linksPage.userId !== req.user.id) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.userLink.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// POST /api/links-page/track-click/:linkId - Track link click (PUBLIC)
router.post('/track-click/:linkId', async (req, res) => {
  try {
    await prisma.userLink.update({
      where: { id: req.params.linkId },
      data: { clickCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track click' });
  }
});

export default router;
