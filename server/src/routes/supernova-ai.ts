/**
 * SUPERNova AI Routes
 *
 * API endpoints for SUPERNova AI chatbot
 */

import { Router } from 'express';
import { SupernovaAIService } from '../services/supernovaAIService';
import { SupernovaConversationService } from '../services/supernovaConversationService';
import { SupernovaMemoryService } from '../services/supernovaMemoryService';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// CONVERSATIONS
// ============================================

/**
 * POST /api/supernova/conversations
 * Start new conversation or get first interaction
 */
router.post('/conversations', async (req, res) => {
  try {
    const { userId, mode } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    // Check if first time user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.onboardingCompleted) {
      const result = await SupernovaAIService.handleFirstInteraction(userId);
      return res.json({
        success: true,
        data: result,
        isFirstInteraction: true,
      });
    }

    // Create new conversation
    const conversation = await SupernovaConversationService.createConversation(userId, mode);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/supernova/conversations
 * List user's conversations
 */
router.get('/conversations', async (req, res) => {
  try {
    const { userId, mode, status, archived } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const conversations = await SupernovaConversationService.listConversations(userId as string, {
      mode: mode as string,
      status: status as string,
      archived: archived === 'true',
    });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/supernova/conversations/:id
 * Get conversation with messages
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await SupernovaConversationService.getConversation(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/supernova/conversations/:id
 * Update conversation
 */
router.patch('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const conversation = await SupernovaConversationService.updateConversation(id, updates);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/supernova/conversations/:id
 * Delete conversation
 */
router.delete('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await SupernovaConversationService.deleteConversation(id);

    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// MESSAGES & CHAT
// ============================================

/**
 * POST /api/supernova/conversations/:id/messages
 * Send message and get AI response
 */
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message are required',
      });
    }

    const result = await SupernovaAIService.chat(userId, id, message);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/supernova/conversations/:id/messages
 * Get conversation messages
 */
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit, offset } = req.query;

    const messages = await SupernovaConversationService.getMessages(
      id,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// MODES
// ============================================

/**
 * POST /api/supernova/switch-mode
 * Switch coaching mode
 */
router.post('/switch-mode', async (req, res) => {
  try {
    const { conversationId, mode } = req.body;

    if (!conversationId || !mode) {
      return res.status(400).json({
        success: false,
        error: 'conversationId and mode are required',
      });
    }

    const conversation = await SupernovaConversationService.switchMode(conversationId, mode);

    res.json({
      success: true,
      data: conversation,
      message: `Switched to ${mode} mode`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/supernova/modes
 * Get available coaching modes
 */
router.get('/modes', async (req, res) => {
  try {
    const modes = [
      {
        id: 'body',
        name: 'Confident Body',
        icon: '🔥',
        description: 'Health, wellness, and body confidence',
      },
      {
        id: 'brain',
        name: 'Confident Brain',
        icon: '🧠',
        description: 'Mindset, ADHD support, and mental wellness',
      },
      {
        id: 'business',
        name: 'Confident Business',
        icon: '💼',
        description: 'Strategy, marketing, and growth',
      },
      {
        id: 'general',
        name: 'General',
        icon: '💬',
        description: 'Adapts to any topic',
      },
    ];

    res.json({
      success: true,
      data: modes,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// MEMORY
// ============================================

/**
 * GET /api/supernova/memories
 * Get user memories
 */
router.get('/memories', async (req, res) => {
  try {
    const { userId, category } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const memories = category
      ? await SupernovaMemoryService.getMemoriesByCategory(userId as string, category as string)
      : await SupernovaMemoryService.getUserMemories(userId as string);

    res.json({
      success: true,
      data: memories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/supernova/memories
 * Store memory manually
 */
router.post('/memories', async (req, res) => {
  try {
    const { userId, category, key, value, content, importance } = req.body;

    if (!userId || !category || !key || !value || !content) {
      return res.status(400).json({
        success: false,
        error: 'userId, category, key, value, and content are required',
      });
    }

    const memory = await SupernovaMemoryService.storeMemory({
      userId,
      category,
      key,
      value,
      content,
      importance,
    });

    res.json({
      success: true,
      data: memory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/supernova/memories/:id
 * Update memory
 */
router.patch('/memories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const memory = await SupernovaMemoryService.updateMemory(id, updates);

    res.json({
      success: true,
      data: memory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/supernova/memories/:id
 * Delete memory
 */
router.delete('/memories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await SupernovaMemoryService.deleteMemory(id);

    res.json({
      success: true,
      message: 'Memory deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// PROFILE & ONBOARDING
// ============================================

/**
 * GET /api/supernova/profile
 * Get user profile for SUPERNova
 */
router.get('/profile', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: {
        id: true,
        name: true,
        preferredName: true,
        pronouns: true,
        communicationStyle: true,
        onboardingCompleted: true,
        firstInteractionAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/supernova/profile
 * Update user profile
 */
router.patch('/profile', async (req, res) => {
  try {
    const { userId, preferredName, pronouns, communicationStyle } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        preferredName,
        pronouns,
        communicationStyle,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/supernova/onboarding
 * Complete onboarding
 */
router.post('/onboarding', async (req, res) => {
  try {
    const { userId, preferredName, pronouns, communicationStyle } = req.body;

    if (!userId || !preferredName || !pronouns) {
      return res.status(400).json({
        success: false,
        error: 'userId, preferredName, and pronouns are required',
      });
    }

    await SupernovaAIService.completeOnboarding(userId, {
      preferredName,
      pronouns,
      communicationStyle,
    });

    res.json({
      success: true,
      message: 'Onboarding completed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
