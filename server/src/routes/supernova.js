import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireUpgradeOrMember } from '../middleware/auth.js';
import { generateSupernovaResponse, generateSupernovaResponseStream, generateConversationTitle } from '../services/supernovaService.js';
import { validateMessage } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/supernova/conversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: req.user.id,
        isArchived: false,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/supernova/conversations
router.post('/conversations', async (req, res) => {
  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.id,
        title: 'New Conversation',
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/supernova/conversations/:id
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// DELETE /api/supernova/conversations/:id
router.delete('/conversations/:id', async (req, res) => {
  try {
    await prisma.conversation.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// POST /api/supernova/chat
router.post('/chat', validateMessage, async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Store user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        userId: req.user.id,
        role: 'USER',
        content,
      },
    });

    // Generate AI response
    const aiResponse = await generateSupernovaResponse(
      req.user.id,
      conversationId,
      content
    );

    // Store AI message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        userId: req.user.id,
        role: 'ASSISTANT',
        content: aiResponse.message,
        tokenCount: aiResponse.tokenCount,
        model: aiResponse.model,
      },
    });

    // Update conversation title if this is the first message
    const messageCount = await prisma.message.count({
      where: { conversationId },
    });

    if (messageCount === 2) {
      const title = await generateConversationTitle(content);
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title },
      });
    }

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// POST /api/supernova/chat/stream
router.post('/chat/stream', validateMessage, async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    // Verify conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Store user message
    await prisma.message.create({
      data: {
        conversationId,
        userId: req.user.id,
        role: 'USER',
        content,
      },
    });

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get streaming response
    const stream = await generateSupernovaResponseStream(
      req.user.id,
      conversationId,
      content
    );

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Store complete AI message
    await prisma.message.create({
      data: {
        conversationId,
        userId: req.user.id,
        role: 'ASSISTANT',
        content: fullResponse,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ error: 'Streaming failed' });
  }
});

export default router;
