import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendNewDM } from '../services/emailService.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/messages - Get conversations list
router.get('/', async (req, res) => {
  try {
    // Get unique conversations (grouped by other user)
    const [sent, received] = await Promise.all([
      prisma.directMessage.findMany({
        where: { senderId: req.user.id },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.directMessage.findMany({
        where: { receiverId: req.user.id },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Group by conversation partner
    const conversationsMap = new Map();

    sent.forEach(msg => {
      const partnerId = msg.receiver.id;
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner: msg.receiver,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
    });

    received.forEach(msg => {
      const partnerId = msg.sender.id;
      const existing = conversationsMap.get(partnerId);
      const unreadCount = existing ? existing.unreadCount + (msg.isRead ? 0 : 1) : (msg.isRead ? 0 : 1);

      conversationsMap.set(partnerId, {
        partner: msg.sender,
        lastMessage: existing && new Date(existing.lastMessage.createdAt) > new Date(msg.createdAt)
          ? existing.lastMessage
          : msg,
        unreadCount,
      });
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/messages/:userId - Get messages with specific user
router.get('/:userId', async (req, res) => {
  try {
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages/:userId - Send message to user
router.post('/:userId', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId: req.user.id,
        receiverId: req.params.userId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Send email notification (async)
    const sender = await prisma.user.findUnique({ where: { id: req.user.id } });
    sendNewDM(
      message.receiver,
      sender,
      content.substring(0, 100)
    ).catch(console.error);

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.params.userId,
        type: 'NEW_DM',
        title: 'New Message',
        message: `${sender.name} sent you a message`,
        link: `/messages/${req.user.id}`,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages/unread/count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await prisma.directMessage.count({
      where: {
        receiverId: req.user.id,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
