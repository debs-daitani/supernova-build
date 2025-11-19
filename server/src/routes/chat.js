/**
 * Chat Routes
 * API endpoints for live chat widget
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const chatService = require('../services/chatService');

const prisma = new PrismaClient();

// ============================================================================
// WIDGET MANAGEMENT (Authenticated)
// ============================================================================

/**
 * Get user's chat widgets
 * GET /api/chat/widgets
 */
router.get('/widgets', authenticateToken, async (req, res) => {
  try {
    const widgets = await prisma.chatWidget.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, widgets });
  } catch (error) {
    console.error('Error getting widgets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get specific widget by ID
 * GET /api/chat/widgets/:id
 */
router.get('/widgets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const widget = await prisma.chatWidget.findUnique({
      where: { id }
    });

    if (!widget || widget.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Widget not found' });
    }

    res.json({ success: true, widget });
  } catch (error) {
    console.error('Error getting widget:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create chat widget
 * POST /api/chat/widgets
 */
router.post('/widgets', authenticateToken, async (req, res) => {
  try {
    const { name, websiteUrl, settings } = req.body;

    // Generate unique embed code
    const embedCode = generateEmbedCode();

    const widget = await prisma.chatWidget.create({
      data: {
        userId: req.user.id,
        name,
        websiteUrl,
        embedCode,
        settings: settings || {}
      }
    });

    res.json({ success: true, widget });
  } catch (error) {
    console.error('Error creating widget:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get widget by embed code (Public - for widget initialization)
 * GET /api/chat/widgets/embed/:embedCode
 */
router.get('/widgets/embed/:embedCode', async (req, res) => {
  try {
    const { embedCode } = req.params;

    const widget = await prisma.chatWidget.findUnique({
      where: { embedCode },
      select: {
        id: true,
        name: true,
        position: true,
        primaryColor: true,
        avatar: true,
        greeting: true,
        offlineMessage: true,
        settings: true,
        isActive: true
      }
    });

    if (!widget) {
      return res.status(404).json({ success: false, error: 'Widget not found' });
    }

    if (!widget.isActive) {
      return res.status(403).json({ success: false, error: 'Widget is not active' });
    }

    res.json({ success: true, widget });
  } catch (error) {
    console.error('Error getting widget:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update widget settings
 * PATCH /api/chat/widgets/:id
 */
router.patch('/widgets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, websiteUrl, position, primaryColor, avatar, greeting, offlineMessage, settings, isActive } = req.body;

    // Check ownership
    const widget = await prisma.chatWidget.findUnique({
      where: { id }
    });

    if (!widget || widget.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const updated = await prisma.chatWidget.update({
      where: { id },
      data: {
        name,
        websiteUrl,
        position,
        primaryColor,
        avatar,
        greeting,
        offlineMessage,
        settings,
        isActive
      }
    });

    res.json({ success: true, widget: updated });
  } catch (error) {
    console.error('Error updating widget:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CONVERSATIONS
// ============================================================================

/**
 * List conversations
 * GET /api/chat/conversations
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { widgetId, status, assignedToMe, limit, offset } = req.query;

    const filters = {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    if (widgetId) filters.widgetId = widgetId;
    if (status) filters.status = status;
    if (assignedToMe === 'true') filters.assignedToId = req.user.id;

    const result = await chatService.listConversations(prisma, filters);

    res.json(result);
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get conversation with messages
 * GET /api/chat/conversations/:id
 */
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await chatService.getConversation(prisma, id);

    if (result.success) {
      // Mark messages as read
      await chatService.markAsRead(prisma, id, req.user.id);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send message in conversation
 * POST /api/chat/conversations/:id/messages
 */
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments, isInternal } = req.body;

    const result = await chatService.sendMessage(prisma, {
      conversationId: id,
      senderId: req.user.id,
      senderType: 'AGENT',
      senderName: req.user.name,
      userId: req.user.id,
      message,
      attachments: attachments || [],
      isInternal: isInternal || false
    });

    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Assign conversation
 * POST /api/chat/conversations/:id/assign
 */
router.post('/conversations/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const result = await chatService.assignConversation(prisma, id, userId);

    res.json(result);
  } catch (error) {
    console.error('Error assigning conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Close conversation
 * POST /api/chat/conversations/:id/close
 */
router.post('/conversations/:id/close', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await chatService.closeConversation(prisma, id);

    res.json(result);
  } catch (error) {
    console.error('Error closing conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// VISITOR TRACKING
// ============================================================================

/**
 * Get online visitors
 * GET /api/chat/visitors/online
 */
router.get('/visitors/online', authenticateToken, async (req, res) => {
  try {
    const { widgetId } = req.query;

    const result = await chatService.getOnlineVisitors(prisma, widgetId);

    res.json(result);
  } catch (error) {
    console.error('Error getting online visitors:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CANNED RESPONSES
// ============================================================================

/**
 * Get canned responses
 * GET /api/chat/canned-responses
 */
router.get('/canned-responses', authenticateToken, async (req, res) => {
  try {
    const result = await chatService.getCannedResponses(prisma, req.user.id);

    res.json(result);
  } catch (error) {
    console.error('Error getting canned responses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create canned response
 * POST /api/chat/canned-responses
 */
router.post('/canned-responses', authenticateToken, async (req, res) => {
  try {
    const { title, message, category } = req.body;

    const result = await chatService.createCannedResponse(prisma, req.user.id, {
      title,
      message,
      category
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating canned response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update canned response
 * PATCH /api/chat/canned-responses/:id
 */
router.patch('/canned-responses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, category } = req.body;

    const response = await prisma.cannedResponse.update({
      where: {
        id,
        userId: req.user.id
      },
      data: {
        title,
        message,
        category
      }
    });

    res.json({ success: true, response });
  } catch (error) {
    console.error('Error updating canned response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Use canned response
 * POST /api/chat/canned-responses/:id/use
 */
router.post('/canned-responses/:id/use', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await chatService.useCannedResponse(prisma, id);

    res.json(result);
  } catch (error) {
    console.error('Error using canned response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete canned response
 * DELETE /api/chat/canned-responses/:id
 */
router.delete('/canned-responses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cannedResponse.delete({
      where: {
        id,
        userId: req.user.id
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting canned response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CHATBOT RULES
// ============================================================================

/**
 * Get chatbot rules
 * GET /api/chat/widgets/:widgetId/bot-rules
 */
router.get('/widgets/:widgetId/bot-rules', authenticateToken, async (req, res) => {
  try {
    const { widgetId } = req.params;

    const result = await chatService.getChatbotRules(prisma, widgetId);

    res.json(result);
  } catch (error) {
    console.error('Error getting chatbot rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create chatbot rule
 * POST /api/chat/widgets/:widgetId/bot-rules
 */
router.post('/widgets/:widgetId/bot-rules', authenticateToken, async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { name, keywords, response, isActive } = req.body;

    const result = await chatService.createChatbotRule(prisma, widgetId, {
      name,
      keywords,
      response,
      isActive
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating chatbot rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete chatbot rule
 * DELETE /api/chat/bot-rules/:id
 */
router.delete('/bot-rules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.chatbotRule.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chatbot rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// HELPERS
// ============================================================================

function generateEmbedCode() {
  return 'cw_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = router;
