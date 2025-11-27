import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Initialize or get active conversation
async function getOrCreateConversation(userId, type = 'chat') {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  // Check if first contact needed
  if (!user.supernovaIntroduced && type === 'chat') {
    // Create first contact conversation
    const conversation = await prisma.aIConversation.create({
      data: {
        userId,
        conversationType: 'first_contact',
        messages: [
          {
            role: 'assistant',
            content: `Hey there! 👋

I'm SUPERNova, Debs' AI assistant. Think of me as your business coach, tech support, and hype person all rolled into one.

Before we dive in, let me get to know you properly.

What's your name?`,
            timestamp: new Date().toISOString()
          }
        ]
      }
    });

    return {
      conversation,
      isFirstContact: true,
      step: 'ask_name'
    };
  }

  // Get or create regular conversation
  let conversation = await prisma.aIConversation.findFirst({
    where: {
      userId,
      conversationType: type,
      isActive: true
    },
    orderBy: { lastMessageAt: 'desc' }
  });

  if (!conversation) {
    const greeting = `Hey ${user.preferredName || user.name}! What's up? 🚀`;

    conversation = await prisma.aIConversation.create({
      data: {
        userId,
        conversationType: type,
        messages: [
          {
            role: 'assistant',
            content: greeting,
            timestamp: new Date().toISOString()
          }
        ]
      }
    });
  }

  return {
    conversation,
    isFirstContact: false
  };
}

// Handle first contact flow
async function handleFirstContactMessage(conversationId, userId, message, currentStep) {
  const conversation = await prisma.aIConversation.findUnique({
    where: { id: conversationId }
  });

  const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
  let response;
  let nextStep;

  // Determine current step from conversation
  const messageCount = messages.filter(m => m.role === 'user').length;

  switch(messageCount) {
    case 0: // First response - name given
      const userName = message.trim();
      response = `Lovely to meet you, ${userName}!

Quick question: What would you like me to call you?

Your full name (${userName})? A nickname? Something else entirely?

(I want to make sure I'm addressing you the way YOU want to be addressed.)`;
      nextStep = 'ask_preferred_name';
      break;

    case 1: // Second response - preferred name given
      const preferredName = message.trim();

      await prisma.user.update({
        where: { id: userId },
        data: { preferredName }
      });

      response = `Got it! I'll call you ${preferredName} from now on.

One more thing: What are your pronouns?

she/her, he/him, they/them, or something else?

(This helps me communicate with respect and get it right every time.)`;
      nextStep = 'ask_pronouns';
      break;

    case 2: // Third response - pronouns given
      const pronouns = message.trim();

      await prisma.user.update({
        where: { id: userId },
        data: {
          pronouns,
          supernovaIntroduced: true,
          firstContactAt: new Date()
        }
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      response = `Perfect, ${updatedUser.preferredName}! I've got everything I need.

Here's the deal with me:
• I speak directly - no corporate BS
• I'm here 24/7 whenever you need help
• I know all of Debs' frameworks and methodologies
• I can help with literally ANY part of the platform
• Profanity welcome 😎

So... what can I help you build today? 🚀`;

      // Convert to regular chat
      await prisma.aIConversation.update({
        where: { id: conversationId },
        data: {
          conversationType: 'chat',
          preferencesCollected: true
        }
      });

      nextStep = 'complete';
      break;

    default:
      response = "Something went wrong. Let's start over. What's your name?";
      nextStep = 'ask_name';
  }

  // Add messages to conversation
  const updatedMessages = [
    ...messages,
    { role: 'user', content: message, timestamp: new Date().toISOString() },
    { role: 'assistant', content: response, timestamp: new Date().toISOString() }
  ];

  await prisma.aIConversation.update({
    where: { id: conversationId },
    data: {
      messages: updatedMessages,
      lastMessageAt: new Date()
    }
  });

  return {
    response,
    nextStep,
    isComplete: nextStep === 'complete',
    messages: updatedMessages
  };
}

// Get pronoun forms
function getPronounForms(pronounString) {
  if (!pronounString) return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' };

  const lower = pronounString.toLowerCase().trim();

  // Parse common formats
  if (lower.includes('she')) {
    return { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself' };
  }
  if (lower.includes('he')) {
    return { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself' };
  }
  if (lower.includes('they')) {
    return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' };
  }

  // Neopronouns - try to parse
  const parts = lower.split('/');
  if (parts.length >= 2) {
    return {
      subject: parts[0],
      object: parts[1],
      possessive: parts[2] || parts[1],
      reflexive: parts[3] || parts[0] + 'self'
    };
  }

  // Default to they/them
  return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' };
}

// ============================================
// CHAT ENDPOINTS
// ============================================

// Initialize chat
router.post('/chat/init', authenticate, async (req, res) => {
  try {
    const result = await getOrCreateConversation(req.user.id, 'chat');

    res.json({
      conversationId: result.conversation.id,
      messages: result.conversation.messages,
      isFirstContact: result.isFirstContact,
      step: result.step
    });
  } catch (error) {
    console.error('Initialize chat error:', error);
    res.status(500).json({ error: 'Failed to initialize chat' });
  }
});

// Send message
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { conversationId, message, isFirstContact } = req.body;

    if (!message || !conversationId) {
      return res.status(400).json({ error: 'Message and conversation ID required' });
    }

    // Check if first contact
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Handle first contact flow
    if (conversation.conversationType === 'first_contact' || isFirstContact) {
      const result = await handleFirstContactMessage(
        conversationId,
        req.user.id,
        message,
        conversation.messages.length
      );

      return res.json({
        response: result.response,
        messages: result.messages,
        isFirstContact: !result.isComplete,
        nextStep: result.nextStep
      });
    }

    // Regular chat - would integrate with OpenAI/Claude here
    // For now, just echo back with a placeholder
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { onboardingProgress: true }
    });

    const pronouns = getPronounForms(user.pronouns);
    const preferredName = user.preferredName || user.name;

    // Placeholder response (would be AI-generated in production)
    const aiResponse = `Hey ${preferredName}! I hear you.

Right now I'm in demo mode, but once Debs uploads the full SUPERNova brain, I'll be able to help with anything you need.

Until then, know that ${pronouns.subject}'s crushing it! 🚀`;

    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const updatedMessages = [
      ...messages,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ];

    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        messages: updatedMessages,
        lastMessageAt: new Date()
      }
    });

    res.json({
      response: aiResponse,
      messages: updatedMessages,
      isFirstContact: false
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get user conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: req.user.id },
      orderBy: { lastMessageAt: 'desc' },
      take: 50
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Delete conversation
router.delete('/conversations/:id', authenticate, async (req, res) => {
  try {
    await prisma.aIConversation.delete({
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user owns conversation
      }
    });

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Update user preferences
router.patch('/preferences', authenticate, async (req, res) => {
  try {
    const { preferredName, pronouns, addressStyle } = req.body;

    const updateData = {};
    if (preferredName !== undefined) updateData.preferredName = preferredName;
    if (pronouns !== undefined) updateData.pronouns = pronouns;
    if (addressStyle !== undefined) updateData.addressStyle = addressStyle;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json(user);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// ============================================
// KNOWLEDGE BASE ENDPOINTS (Admin)
// ============================================

// Upload knowledge base
router.post('/knowledge', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      version,
      content,
      frameworks,
      pillars,
      methodologies,
      voiceTone,
      firstContactProtocol,
      description,
      tokenCount
    } = req.body;

    if (!version || !content) {
      return res.status(400).json({ error: 'Version and content required' });
    }

    const knowledge = await prisma.knowledgeBase.create({
      data: {
        version,
        content,
        frameworks,
        pillars,
        methodologies,
        voiceTone,
        firstContactProtocol,
        description,
        tokenCount
      }
    });

    res.json(knowledge);
  } catch (error) {
    console.error('Upload knowledge error:', error);
    res.status(500).json({ error: 'Failed to upload knowledge base' });
  }
});

// Get all knowledge versions
router.get('/knowledge', authenticate, requireAdmin, async (req, res) => {
  try {
    const knowledge = await prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(knowledge);
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ error: 'Failed to get knowledge bases' });
  }
});

// Get active knowledge base (public for AI context)
router.get('/knowledge/active', async (req, res) => {
  try {
    const knowledge = await prisma.knowledgeBase.findFirst({
      where: { isActive: true }
    });

    if (!knowledge) {
      return res.status(404).json({ error: 'No active knowledge base' });
    }

    res.json(knowledge);
  } catch (error) {
    console.error('Get active knowledge error:', error);
    res.status(500).json({ error: 'Failed to get active knowledge base' });
  }
});

// Get specific version
router.get('/knowledge/:version', authenticate, requireAdmin, async (req, res) => {
  try {
    const knowledge = await prisma.knowledgeBase.findUnique({
      where: { version: req.params.version }
    });

    if (!knowledge) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    res.json(knowledge);
  } catch (error) {
    console.error('Get knowledge version error:', error);
    res.status(500).json({ error: 'Failed to get knowledge base' });
  }
});

// Activate knowledge version
router.patch('/knowledge/:id/activate', authenticate, requireAdmin, async (req, res) => {
  try {
    // Deactivate all others
    await prisma.knowledgeBase.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Activate this one
    const knowledge = await prisma.knowledgeBase.update({
      where: { id: req.params.id },
      data: {
        isActive: true,
        activatedAt: new Date()
      }
    });

    res.json(knowledge);
  } catch (error) {
    console.error('Activate knowledge error:', error);
    res.status(500).json({ error: 'Failed to activate knowledge base' });
  }
});

// Delete knowledge version
router.delete('/knowledge/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const knowledge = await prisma.knowledgeBase.findUnique({
      where: { id: req.params.id }
    });

    if (knowledge?.isActive) {
      return res.status(400).json({ error: 'Cannot delete active knowledge base' });
    }

    await prisma.knowledgeBase.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Knowledge base deleted' });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge base' });
  }
});

// ============================================
// COACHING MOMENTS ENDPOINTS
// ============================================

// Get active coaching moments for user
router.get('/coaching-moments', authenticate, async (req, res) => {
  try {
    const { trigger } = req.query;

    // Get moments user hasn't seen (or can see multiple times)
    const where = {};
    if (trigger) {
      where.triggerEvent = trigger;
    }

    const moments = await prisma.coachingMoment.findMany({
      where,
      orderBy: { priority: 'desc' }
    });

    // Filter out moments user has already seen (if showOnce)
    const userLogs = await prisma.userCoachingLog.findMany({
      where: { userId: req.user.id }
    });

    const seenMomentIds = new Set(userLogs.map(log => log.momentId));

    const availableMoments = moments.filter(moment => {
      if (!moment.showOnce) return true;
      return !seenMomentIds.has(moment.id);
    });

    res.json(availableMoments);
  } catch (error) {
    console.error('Get coaching moments error:', error);
    res.status(500).json({ error: 'Failed to get coaching moments' });
  }
});

// Dismiss coaching moment
router.post('/coaching-moments/:id/dismiss', authenticate, async (req, res) => {
  try {
    const log = await prisma.userCoachingLog.create({
      data: {
        userId: req.user.id,
        momentId: req.params.id,
        dismissed: true
      }
    });

    res.json(log);
  } catch (error) {
    console.error('Dismiss coaching moment error:', error);
    res.status(500).json({ error: 'Failed to dismiss coaching moment' });
  }
});

// Log coaching moment action
router.post('/coaching-moments/:id/action', authenticate, async (req, res) => {
  try {
    const log = await prisma.userCoachingLog.create({
      data: {
        userId: req.user.id,
        momentId: req.params.id,
        actionTaken: true
      }
    });

    res.json(log);
  } catch (error) {
    console.error('Log coaching action error:', error);
    res.status(500).json({ error: 'Failed to log coaching action' });
  }
});

// Create coaching moment (admin)
router.post('/coaching-moments', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      triggerEvent,
      title,
      message,
      framework,
      pillar,
      actionText,
      actionUrl,
      showOnce,
      priority
    } = req.body;

    if (!triggerEvent || !title || !message) {
      return res.status(400).json({ error: 'Trigger event, title, and message required' });
    }

    const moment = await prisma.coachingMoment.create({
      data: {
        triggerEvent,
        title,
        message,
        framework,
        pillar,
        actionText,
        actionUrl,
        showOnce: showOnce || false,
        priority: priority || 0
      }
    });

    res.json(moment);
  } catch (error) {
    console.error('Create coaching moment error:', error);
    res.status(500).json({ error: 'Failed to create coaching moment' });
  }
});

// ============================================
// AI INSIGHTS ENDPOINTS
// ============================================

// Get user insights
router.get('/insights', authenticate, async (req, res) => {
  try {
    const insights = await prisma.aIInsight.findMany({
      where: { userId: req.user.id },
      orderBy: { generatedAt: 'desc' },
      take: 10
    });

    res.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// Mark insight as viewed
router.post('/insights/:id/view', authenticate, async (req, res) => {
  try {
    const insight = await prisma.aIInsight.update({
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user owns insight
      },
      data: { viewed: true }
    });

    res.json(insight);
  } catch (error) {
    console.error('Mark insight viewed error:', error);
    res.status(500).json({ error: 'Failed to mark insight as viewed' });
  }
});

// Mark insight as acted on
router.post('/insights/:id/action', authenticate, async (req, res) => {
  try {
    const insight = await prisma.aIInsight.update({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      data: { actedOn: true }
    });

    res.json(insight);
  } catch (error) {
    console.error('Mark insight acted error:', error);
    res.status(500).json({ error: 'Failed to mark insight as acted on' });
  }
});

// ============================================
// ANALYTICS ENDPOINTS (Admin)
// ============================================

// Get usage analytics
router.get('/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalConversations = await prisma.aIConversation.count();
    const activeConversations = await prisma.aIConversation.count({
      where: { isActive: true }
    });
    const firstContactCompleted = await prisma.user.count({
      where: { supernovaIntroduced: true }
    });
    const totalUsers = await prisma.user.count();

    const conversationTypes = await prisma.aIConversation.groupBy({
      by: ['conversationType'],
      _count: true
    });

    const coachingMomentsShown = await prisma.userCoachingLog.count();
    const coachingActionsTaken = await prisma.userCoachingLog.count({
      where: { actionTaken: true }
    });

    const insightsGenerated = await prisma.aIInsight.count();
    const insightsActedOn = await prisma.aIInsight.count({
      where: { actedOn: true }
    });

    res.json({
      conversations: {
        total: totalConversations,
        active: activeConversations,
        byType: conversationTypes
      },
      users: {
        total: totalUsers,
        firstContactCompleted,
        completionRate: totalUsers > 0 ? ((firstContactCompleted / totalUsers) * 100).toFixed(1) : 0
      },
      coaching: {
        shown: coachingMomentsShown,
        actionsTaken: coachingActionsTaken,
        actionRate: coachingMomentsShown > 0 ? ((coachingActionsTaken / coachingMomentsShown) * 100).toFixed(1) : 0
      },
      insights: {
        generated: insightsGenerated,
        actedOn: insightsActedOn,
        actionRate: insightsGenerated > 0 ? ((insightsActedOn / insightsGenerated) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get all conversations (for training)
router.get('/conversations/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { type, limit = 100 } = req.query;

    const where = {};
    if (type) {
      where.conversationType = type;
    }

    const conversations = await prisma.aIConversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            preferredName: true,
            pronouns: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

export default router;
