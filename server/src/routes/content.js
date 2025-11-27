import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { searchContent, curateProgram, getRecommendations, trackProgress } from '../services/contentCurationService.js';

const router = express.Router();

router.use(authenticate);

// GET /api/content - Browse content
router.get('/', async (req, res) => {
  try {
    const { query, pillar, contentType, limit = 20 } = req.query;

    const content = await searchContent({
      query,
      pillar,
      contentType,
      accessLevel: req.user.accountType,
      limit: parseInt(limit),
    });

    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// GET /api/content/:id
router.get('/:id', async (req, res) => {
  try {
    const content = await prisma.content.findUnique({
      where: { id: req.params.id },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check access level
    const accessHierarchy = { FREE: 0, UPGRADE: 1, MEMBER: 2 };
    const userLevel = accessHierarchy[req.user.accountType];
    const contentLevel = accessHierarchy[content.accessLevel];

    if (userLevel < contentLevel) {
      return res.status(403).json({ error: 'Upgrade required to access this content' });
    }

    // Increment view count
    await prisma.content.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get user's progress
    const progress = await prisma.contentProgress.findUnique({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId: req.params.id,
        },
      },
    });

    res.json({ ...content, userProgress: progress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// POST /api/content/:id/progress
router.post('/:id/progress', async (req, res) => {
  try {
    const { progress, completed } = req.body;

    const updated = await trackProgress(
      req.user.id,
      req.params.id,
      parseInt(progress),
      completed
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// POST /api/content/curate
router.post('/curate', async (req, res) => {
  try {
    const { query, pillar } = req.body;

    const program = await curateProgram(
      query,
      req.user.accountType,
      pillar
    );

    res.json(program);
  } catch (error) {
    res.status(500).json({ error: 'Failed to curate program' });
  }
});

// GET /api/content/recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user.id, 5);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// GET /api/content/my/progress
router.get('/my/progress', async (req, res) => {
  try {
    const progress = await prisma.contentProgress.findMany({
      where: { userId: req.user.id },
      include: { content: true },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;
