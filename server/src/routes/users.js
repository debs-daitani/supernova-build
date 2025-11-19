import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/me
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        niche: true,
        skills: true,
        accountType: true,
        isAdmin: true,
        quizResult: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
  try {
    const { name, bio, location, niche, skills, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(location && { location }),
        ...(niche && { niche }),
        ...(skills && { skills }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        niche: true,
        skills: true,
        accountType: true,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/users/quiz
router.post('/quiz', async (req, res) => {
  try {
    const { quizResult, quizAnswers } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        quizResult,
        quizAnswers,
      },
      select: {
        id: true,
        quizResult: true,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save quiz results' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        niche: true,
        skills: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users - List all users (for member directory)
router.get('/', async (req, res) => {
  try {
    const { search, niche, location, limit = 20, offset = 0 } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (niche) {
      where.niche = { contains: niche, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          location: true,
          niche: true,
          skills: true,
          createdAt: true,
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

export default router;
