import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// CHATBOT MANAGEMENT
// ============================================

// Get all chatbots for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const chatbots = await prisma.chatbot.findMany({
      where: { userId: req.user.id },
      include: {
        flows: true,
        triggers: true,
        _count: {
          select: {
            conversations: true,
            flows: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(chatbots);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    res.status(500).json({ error: 'Failed to fetch chatbots' });
  }
});

// Get a specific chatbot
router.get('/:id', authenticate, async (req, res) => {
  try {
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        flows: true,
        triggers: true,
        _count: {
          select: { conversations: true }
        }
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    res.json(chatbot);
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    res.status(500).json({ error: 'Failed to fetch chatbot' });
  }
});

// Create a new chatbot
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, deploymentType, websiteUrl, primaryColor, avatar, welcomeMessage, aiHandoffEnabled } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Chatbot name is required' });
    }

    const chatbot = await prisma.chatbot.create({
      data: {
        userId: req.user.id,
        name,
        description,
        deploymentType: deploymentType || 'website',
        websiteUrl,
        primaryColor: primaryColor || '#FF1493',
        avatar,
        welcomeMessage: welcomeMessage || `Hi! 👋 How can I help you today?`,
        aiHandoffEnabled: aiHandoffEnabled || false,
        enabled: false
      }
    });

    res.status(201).json(chatbot);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    res.status(500).json({ error: 'Failed to create chatbot' });
  }
});

// Update a chatbot
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, deploymentType, websiteUrl, primaryColor, avatar, welcomeMessage, enabled, aiHandoffEnabled } = req.body;

    // Verify ownership
    const existing = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const chatbot = await prisma.chatbot.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(deploymentType && { deploymentType }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(primaryColor && { primaryColor }),
        ...(avatar !== undefined && { avatar }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(enabled !== undefined && { enabled }),
        ...(aiHandoffEnabled !== undefined && { aiHandoffEnabled })
      }
    });

    res.json(chatbot);
  } catch (error) {
    console.error('Error updating chatbot:', error);
    res.status(500).json({ error: 'Failed to update chatbot' });
  }
});

// Delete a chatbot
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const existing = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    await prisma.chatbot.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    res.status(500).json({ error: 'Failed to delete chatbot' });
  }
});

// ============================================
// FLOW MANAGEMENT
// ============================================

// Get all flows for a chatbot
router.get('/:id/flows', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const flows = await prisma.chatbotFlow.findMany({
      where: { chatbotId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(flows);
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

// Get a specific flow
router.get('/:id/flows/:flowId', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const flow = await prisma.chatbotFlow.findFirst({
      where: {
        id: req.params.flowId,
        chatbotId: req.params.id
      }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    res.json(flow);
  } catch (error) {
    console.error('Error fetching flow:', error);
    res.status(500).json({ error: 'Failed to fetch flow' });
  }
});

// Create a new flow
router.post('/:id/flows', authenticate, async (req, res) => {
  try {
    const { name, description, flowData } = req.body;

    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Flow name is required' });
    }

    const flow = await prisma.chatbotFlow.create({
      data: {
        chatbotId: req.params.id,
        name,
        description,
        flowData: flowData || { nodes: [], edges: [] },
        active: true
      }
    });

    res.status(201).json(flow);
  } catch (error) {
    console.error('Error creating flow:', error);
    res.status(500).json({ error: 'Failed to create flow' });
  }
});

// Update a flow (save flowData)
router.patch('/:id/flows/:flowId', authenticate, async (req, res) => {
  try {
    const { name, description, flowData, active } = req.body;

    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const flow = await prisma.chatbotFlow.update({
      where: { id: req.params.flowId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(flowData && { flowData }),
        ...(active !== undefined && { active })
      }
    });

    res.json(flow);
  } catch (error) {
    console.error('Error updating flow:', error);
    res.status(500).json({ error: 'Failed to update flow' });
  }
});

// Delete a flow
router.delete('/:id/flows/:flowId', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    await prisma.chatbotFlow.delete({
      where: { id: req.params.flowId }
    });

    res.json({ message: 'Flow deleted successfully' });
  } catch (error) {
    console.error('Error deleting flow:', error);
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

// ============================================
// TRIGGER MANAGEMENT
// ============================================

// Get all triggers for a chatbot
router.get('/:id/triggers', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const triggers = await prisma.chatbotTrigger.findMany({
      where: { chatbotId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(triggers);
  } catch (error) {
    console.error('Error fetching triggers:', error);
    res.status(500).json({ error: 'Failed to fetch triggers' });
  }
});

// Create a new trigger
router.post('/:id/triggers', authenticate, async (req, res) => {
  try {
    const { flowId, triggerType, keyword, pageUrl, delayMinutes } = req.body;

    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    if (!flowId || !triggerType) {
      return res.status(400).json({ error: 'Flow ID and trigger type are required' });
    }

    const trigger = await prisma.chatbotTrigger.create({
      data: {
        chatbotId: req.params.id,
        flowId,
        triggerType,
        keyword,
        pageUrl,
        delayMinutes,
        active: true
      }
    });

    res.status(201).json(trigger);
  } catch (error) {
    console.error('Error creating trigger:', error);
    res.status(500).json({ error: 'Failed to create trigger' });
  }
});

// Update a trigger
router.patch('/:id/triggers/:triggerId', authenticate, async (req, res) => {
  try {
    const { flowId, triggerType, keyword, pageUrl, delayMinutes, active } = req.body;

    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const trigger = await prisma.chatbotTrigger.update({
      where: { id: req.params.triggerId },
      data: {
        ...(flowId && { flowId }),
        ...(triggerType && { triggerType }),
        ...(keyword !== undefined && { keyword }),
        ...(pageUrl !== undefined && { pageUrl }),
        ...(delayMinutes !== undefined && { delayMinutes }),
        ...(active !== undefined && { active })
      }
    });

    res.json(trigger);
  } catch (error) {
    console.error('Error updating trigger:', error);
    res.status(500).json({ error: 'Failed to update trigger' });
  }
});

// Delete a trigger
router.delete('/:id/triggers/:triggerId', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    await prisma.chatbotTrigger.delete({
      where: { id: req.params.triggerId }
    });

    res.json({ message: 'Trigger deleted successfully' });
  } catch (error) {
    console.error('Error deleting trigger:', error);
    res.status(500).json({ error: 'Failed to delete trigger' });
  }
});

// ============================================
// ANALYTICS
// ============================================

// Get chatbot analytics
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Get conversation stats
    const totalConversations = await prisma.chatbotConversation.count({
      where: { chatbotId: req.params.id }
    });

    const activeConversations = await prisma.chatbotConversation.count({
      where: {
        chatbotId: req.params.id,
        status: 'active'
      }
    });

    const completedConversations = await prisma.chatbotConversation.count({
      where: {
        chatbotId: req.params.id,
        status: 'completed'
      }
    });

    const abandonedConversations = await prisma.chatbotConversation.count({
      where: {
        chatbotId: req.params.id,
        status: 'abandoned'
      }
    });

    const aiHandoffConversations = await prisma.chatbotConversation.count({
      where: {
        chatbotId: req.params.id,
        status: 'handed_off_to_ai'
      }
    });

    // Calculate completion rate
    const completionRate = totalConversations > 0
      ? (completedConversations / totalConversations * 100).toFixed(1)
      : 0;

    // Get average conversation duration
    const conversations = await prisma.chatbotConversation.findMany({
      where: {
        chatbotId: req.params.id,
        completedAt: { not: null }
      },
      select: {
        startedAt: true,
        completedAt: true
      }
    });

    let avgDuration = 0;
    if (conversations.length > 0) {
      const totalDuration = conversations.reduce((sum, conv) => {
        const duration = new Date(conv.completedAt) - new Date(conv.startedAt);
        return sum + duration;
      }, 0);
      avgDuration = Math.round(totalDuration / conversations.length / 1000); // in seconds
    }

    res.json({
      totalConversations,
      activeConversations,
      completedConversations,
      abandonedConversations,
      aiHandoffConversations,
      completionRate: parseFloat(completionRate),
      avgDurationSeconds: avgDuration
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all conversations for a chatbot
router.get('/:id/conversations', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const conversations = await prisma.chatbotConversation.findMany({
      where: { chatbotId: req.params.id },
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 100 // Limit to recent 100
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get a specific conversation transcript
router.get('/:id/conversations/:convId', authenticate, async (req, res) => {
  try {
    // Verify ownership
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const conversation = await prisma.chatbotConversation.findFirst({
      where: {
        id: req.params.convId,
        chatbotId: req.params.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;
