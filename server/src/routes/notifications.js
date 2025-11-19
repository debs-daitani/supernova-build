import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.notification.count({
        where: { userId: req.user.id },
      }),
      prisma.notification.count({
        where: { userId: req.user.id, read: false },
      }),
    ]);

    res.json({ notifications, total, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: { read: true },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        read: false,
      },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// DELETE /api/notifications - Clear all
router.delete('/', async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// GET /api/notifications/unread/count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        read: false,
      },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
