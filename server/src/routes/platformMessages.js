import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// ============================================
// CONVERSATIONS
// ============================================

// Get all conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const { type, archived } = req.query;

    const conversations = await prisma.platformConversation.findMany({
      where: {
        participants: {
          has: req.user.id,
        },
        ...(type && { type }),
        ...(archived !== undefined && { isArchived: archived === 'true' }),
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.platformMessage.count({
          where: {
            conversationId: conv.id,
            senderId: { not: req.user.id },
            readBy: { not: { has: req.user.id } },
          },
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { type, participants, name, description, avatar } = req.body;

    if (!type || !participants || participants.length === 0) {
      return res.status(400).json({ error: 'Type and participants are required' });
    }

    // Add current user to participants if not already included
    const allParticipants = participants.includes(req.user.id)
      ? participants
      : [req.user.id, ...participants];

    // For direct messages, check if conversation already exists
    if (type === 'direct' && allParticipants.length === 2) {
      const existing = await prisma.platformConversation.findFirst({
        where: {
          type: 'direct',
          AND: allParticipants.map(id => ({
            participants: { has: id },
          })),
        },
      });

      if (existing) {
        return res.json(existing);
      }
    }

    const conversation = await prisma.platformConversation.create({
      data: {
        type,
        participants: allParticipants,
        name,
        description,
        avatar,
        createdBy: req.user.id,
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error('Failed to create conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get conversation details
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await prisma.platformConversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Update conversation
router.patch('/conversations/:id', async (req, res) => {
  try {
    const conversation = await prisma.platformConversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.platformConversation.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Delete conversation
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conversation = await prisma.platformConversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.platformConversation.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Archive conversation
router.post('/conversations/:id/archive', async (req, res) => {
  try {
    const updated = await prisma.platformConversation.update({
      where: { id: req.params.id },
      data: { isArchived: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive conversation' });
  }
});

// Mute conversation
router.post('/conversations/:id/mute', async (req, res) => {
  try {
    const { muted } = req.body;

    const updated = await prisma.platformConversation.update({
      where: { id: req.params.id },
      data: { isMuted: muted },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mute conversation' });
  }
});

// ============================================
// MESSAGES
// ============================================

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { limit = 50, before } = req.query;

    // Check if user is participant
    const conversation = await prisma.platformConversation.findUnique({
      where: { id: req.params.conversationId },
    });

    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const messages = await prisma.platformMessage.findMany({
      where: {
        conversationId: req.params.conversationId,
        isDeleted: false,
        ...(before && {
          createdAt: { lt: new Date(before) },
        }),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        replyTo: {
          select: { id: true, content: true, sender: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { messageType = 'text', content, mediaUrl, fileUrl, fileName, fileSize, duration, replyToId } = req.body;

    // Check if user is participant
    const conversation = await prisma.platformConversation.findUnique({
      where: { id: req.params.conversationId },
    });

    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const message = await prisma.platformMessage.create({
      data: {
        conversationId: req.params.conversationId,
        senderId: req.user.id,
        messageType,
        content,
        mediaUrl,
        fileUrl,
        fileName,
        fileSize,
        duration,
        replyToId,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation last message
    await prisma.platformConversation.update({
      where: { id: req.params.conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessage: content || `[${messageType}]`,
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Edit message
router.patch('/messages/:id', async (req, res) => {
  try {
    const message = await prisma.platformMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.platformMessage.update({
      where: { id: req.params.id },
      data: {
        content: req.body.content,
        isEdited: true,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await prisma.platformMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.platformMessage.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: null,
      },
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Mark message as read
router.post('/messages/:id/read', async (req, res) => {
  try {
    const message = await prisma.platformMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add user to readBy array if not already there
    if (!message.readBy.includes(req.user.id)) {
      await prisma.platformMessage.update({
        where: { id: req.params.id },
        data: {
          readBy: {
            push: req.user.id,
          },
        },
      });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Mark all messages in conversation as read
router.post('/conversations/:conversationId/read-all', async (req, res) => {
  try {
    const conversation = await prisma.platformConversation.findUnique({
      where: { id: req.params.conversationId },
    });

    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get all unread messages
    const unreadMessages = await prisma.platformMessage.findMany({
      where: {
        conversationId: req.params.conversationId,
        senderId: { not: req.user.id },
        readBy: { not: { has: req.user.id } },
      },
    });

    // Update each message
    await Promise.all(
      unreadMessages.map(msg =>
        prisma.platformMessage.update({
          where: { id: msg.id },
          data: {
            readBy: {
              push: req.user.id,
            },
          },
        })
      )
    );

    res.json({ message: 'All messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all messages as read' });
  }
});

// ============================================
// STATUS UPDATES
// ============================================

// Create status update
router.post('/status', async (req, res) => {
  try {
    const { mediaType, mediaUrl, caption, backgroundColor } = req.body;

    if (!mediaType) {
      return res.status(400).json({ error: 'Media type is required' });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    const status = await prisma.statusUpdate.create({
      data: {
        userId: req.user.id,
        mediaType,
        mediaUrl,
        caption,
        backgroundColor,
        expiresAt,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json(status);
  } catch (error) {
    console.error('Failed to create status:', error);
    res.status(500).json({ error: 'Failed to create status' });
  }
});

// Get all status updates (from contacts/participants)
router.get('/status', async (req, res) => {
  try {
    // Get all conversations to find contacts
    const conversations = await prisma.platformConversation.findMany({
      where: {
        participants: { has: req.user.id },
      },
    });

    // Extract unique user IDs from all participants
    const contactIds = [...new Set(
      conversations.flatMap(conv => conv.participants).filter(id => id !== req.user.id)
    )];

    // Get active status updates from contacts and self
    const statuses = await prisma.statusUpdate.findMany({
      where: {
        userId: { in: [...contactIds, req.user.id] },
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(statuses);
  } catch (error) {
    console.error('Failed to fetch statuses:', error);
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
});

// Mark status as viewed
router.post('/status/:id/view', async (req, res) => {
  try {
    const status = await prisma.statusUpdate.findUnique({
      where: { id: req.params.id },
    });

    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }

    // Add user to viewedBy array if not already there
    if (!status.viewedBy.includes(req.user.id)) {
      await prisma.statusUpdate.update({
        where: { id: req.params.id },
        data: {
          viewedBy: {
            push: req.user.id,
          },
        },
      });
    }

    res.json({ message: 'Status marked as viewed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark status as viewed' });
  }
});

// Delete status
router.delete('/status/:id', async (req, res) => {
  try {
    const status = await prisma.statusUpdate.findUnique({
      where: { id: req.params.id },
    });

    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }

    if (status.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.statusUpdate.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete status' });
  }
});

// ============================================
// BLOCKING
// ============================================

// Block user
router.post('/block/:userId', async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const blocked = await prisma.blockedUser.upsert({
      where: {
        userId_blockedUserId: {
          userId: req.user.id,
          blockedUserId: req.params.userId,
        },
      },
      create: {
        userId: req.user.id,
        blockedUserId: req.params.userId,
      },
      update: {},
    });

    res.json(blocked);
  } catch (error) {
    console.error('Failed to block user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock user
router.delete('/block/:userId', async (req, res) => {
  try {
    await prisma.blockedUser.deleteMany({
      where: {
        userId: req.user.id,
        blockedUserId: req.params.userId,
      },
    });

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Get blocked users
router.get('/blocked', async (req, res) => {
  try {
    const blocked = await prisma.blockedUser.findMany({
      where: { userId: req.user.id },
      include: {
        blockedUser: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json(blocked);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});

// ============================================
// CALLS
// ============================================

// Initiate call
router.post('/calls/initiate', async (req, res) => {
  try {
    const { conversationId, callType, receiverId } = req.body;

    if (!conversationId || !callType) {
      return res.status(400).json({ error: 'Conversation ID and call type are required' });
    }

    // Get conversation for participants
    const conversation = await prisma.platformConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const call = await prisma.call.create({
      data: {
        conversationId,
        callType,
        callerId: req.user.id,
        receiverId,
        participants: conversation.participants,
        status: 'ringing',
      },
    });

    res.json(call);
  } catch (error) {
    console.error('Failed to initiate call:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// End call
router.post('/calls/:id/end', async (req, res) => {
  try {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const endedAt = new Date();
    const duration = call.startedAt
      ? Math.floor((endedAt - call.startedAt) / 1000)
      : 0;

    const updated = await prisma.call.update({
      where: { id: req.params.id },
      data: {
        status: 'ended',
        endedAt,
        duration,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end call' });
  }
});

// Get call history
router.get('/calls/history', async (req, res) => {
  try {
    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { callerId: req.user.id },
          { receiverId: req.user.id },
          { participants: { has: req.user.id } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

export default router;
