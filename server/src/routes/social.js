import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { subscribeInstagramWebhooks, unsubscribeInstagramWebhooks } from '../services/instagramApi.js';
import { subscribeFacebookWebhooks, unsubscribeFacebookWebhooks } from '../services/facebookApi.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// SOCIAL ACCOUNT MANAGEMENT
// ============================================

// Get all connected social accounts
router.get('/accounts', authMiddleware, async (req, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { automations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    res.status(500).json({ error: 'Failed to fetch social accounts' });
  }
});

// Connect Instagram account (OAuth callback)
router.post('/instagram/connect', authMiddleware, async (req, res) => {
  try {
    const { accessToken, accountId, accountName } = req.body;

    if (!accessToken || !accountId) {
      return res.status(400).json({ error: 'Access token and account ID required' });
    }

    // Create or update social account
    const account = await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: req.user.id,
          platform: 'instagram',
          accountId
        }
      },
      create: {
        userId: req.user.id,
        platform: 'instagram',
        accountId,
        accountName: accountName || accountId,
        accessToken,
        connected: true
      },
      update: {
        accessToken,
        accountName: accountName || accountId,
        connected: true
      }
    });

    // Subscribe to webhooks
    try {
      await subscribeInstagramWebhooks(account.id);
    } catch (webhookError) {
      console.error('Error subscribing to webhooks:', webhookError);
      // Continue anyway - webhooks can be set up later
    }

    res.json(account);
  } catch (error) {
    console.error('Error connecting Instagram:', error);
    res.status(500).json({ error: 'Failed to connect Instagram account' });
  }
});

// Connect Facebook account (OAuth callback)
router.post('/facebook/connect', authMiddleware, async (req, res) => {
  try {
    const { accessToken, accountId, accountName } = req.body;

    if (!accessToken || !accountId) {
      return res.status(400).json({ error: 'Access token and account ID required' });
    }

    // Create or update social account
    const account = await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: req.user.id,
          platform: 'facebook',
          accountId
        }
      },
      create: {
        userId: req.user.id,
        platform: 'facebook',
        accountId,
        accountName: accountName || accountId,
        accessToken,
        connected: true
      },
      update: {
        accessToken,
        accountName: accountName || accountId,
        connected: true
      }
    });

    // Subscribe to webhooks
    try {
      await subscribeFacebookWebhooks(account.id);
    } catch (webhookError) {
      console.error('Error subscribing to webhooks:', webhookError);
      // Continue anyway
    }

    res.json(account);
  } catch (error) {
    console.error('Error connecting Facebook:', error);
    res.status(500).json({ error: 'Failed to connect Facebook account' });
  }
});

// Disconnect social account
router.delete('/accounts/:accountId', authMiddleware, async (req, res) => {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: req.params.accountId,
        userId: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Unsubscribe from webhooks
    try {
      if (account.platform === 'instagram') {
        await unsubscribeInstagramWebhooks(account.id);
      } else if (account.platform === 'facebook') {
        await unsubscribeFacebookWebhooks(account.id);
      }
    } catch (error) {
      console.error('Error unsubscribing from webhooks:', error);
    }

    // Delete account
    await prisma.socialAccount.delete({
      where: { id: req.params.accountId }
    });

    res.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

// ============================================
// AUTOMATION MANAGEMENT
// ============================================

// Get all automations
router.get('/automations', authMiddleware, async (req, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.user.id }
    });

    const accountIds = accounts.map(a => a.id);

    const automations = await prisma.socialAutomation.findMany({
      where: { accountId: { in: accountIds } },
      include: {
        account: true,
        _count: {
          select: { conversations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

// Create automation
router.post('/automations', authMiddleware, async (req, res) => {
  try {
    const { accountId, name, automationType, triggerType, keywords, postUrl, actionFlow } = req.body;

    // Verify account ownership
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        userId: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const automation = await prisma.socialAutomation.create({
      data: {
        accountId,
        name,
        automationType: automationType || 'dm_sequence',
        triggerType,
        keywords: keywords || [],
        postUrl,
        actionFlow: actionFlow || { steps: [] },
        active: true
      },
      include: { account: true }
    });

    res.status(201).json(automation);
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
});

// Update automation
router.patch('/automations/:id', authMiddleware, async (req, res) => {
  try {
    const { name, automationType, triggerType, keywords, postUrl, actionFlow, active } = req.body;

    // Verify ownership
    const automation = await prisma.socialAutomation.findFirst({
      where: { id: req.params.id },
      include: { account: true }
    });

    if (!automation || automation.account.userId !== req.user.id) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    const updated = await prisma.socialAutomation.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(automationType && { automationType }),
        ...(triggerType && { triggerType }),
        ...(keywords && { keywords }),
        ...(postUrl !== undefined && { postUrl }),
        ...(actionFlow && { actionFlow }),
        ...(active !== undefined && { active })
      },
      include: { account: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating automation:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
});

// Delete automation
router.delete('/automations/:id', authMiddleware, async (req, res) => {
  try {
    const automation = await prisma.socialAutomation.findFirst({
      where: { id: req.params.id },
      include: { account: true }
    });

    if (!automation || automation.account.userId !== req.user.id) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    await prisma.socialAutomation.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
});

// ============================================
// CONVERSATION MANAGEMENT
// ============================================

// Get all conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.user.id }
    });

    const accountIds = accounts.map(a => a.id);

    const conversations = await prisma.socialConversation.findMany({
      where: {
        automation: {
          accountId: { in: accountIds }
        }
      },
      include: {
        automation: {
          include: { account: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 100
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation details
router.get('/conversations/:id', authMiddleware, async (req, res) => {
  try {
    const conversation = await prisma.socialConversation.findFirst({
      where: { id: req.params.id },
      include: {
        automation: {
          include: { account: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation || conversation.automation.account.userId !== req.user.id) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Manual takeover (disable automation for this conversation)
router.post('/conversations/:id/takeover', authMiddleware, async (req, res) => {
  try {
    const conversation = await prisma.socialConversation.findFirst({
      where: { id: req.params.id },
      include: { automation: { include: { account: true } } }
    });

    if (!conversation || conversation.automation.account.userId !== req.user.id) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark conversation as manually managed
    await prisma.socialConversation.update({
      where: { id: req.params.id },
      data: { status: 'manual_takeover' }
    });

    res.json({ message: 'Manual takeover activated' });
  } catch (error) {
    console.error('Error taking over conversation:', error);
    res.status(500).json({ error: 'Failed to takeover conversation' });
  }
});

// ============================================
// ANALYTICS
// ============================================

// Get automation analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.user.id }
    });

    const accountIds = accounts.map(a => a.id);

    const totalAutomations = await prisma.socialAutomation.count({
      where: { accountId: { in: accountIds } }
    });

    const activeAutomations = await prisma.socialAutomation.count({
      where: { accountId: { in: accountIds }, active: true }
    });

    const totalConversations = await prisma.socialConversation.count({
      where: { automation: { accountId: { in: accountIds } } }
    });

    const activeConversations = await prisma.socialConversation.count({
      where: {
        automation: { accountId: { in: accountIds } },
        status: 'active'
      }
    });

    const completedConversations = await prisma.socialConversation.count({
      where: {
        automation: { accountId: { in: accountIds } },
        status: 'completed'
      }
    });

    const leadsCapture = await prisma.socialConversation.count({
      where: {
        automation: { accountId: { in: accountIds } },
        leadEmail: { not: null }
      }
    });

    res.json({
      totalAutomations,
      activeAutomations,
      totalConversations,
      activeConversations,
      completedConversations,
      leadsCapture,
      conversionRate: totalConversations > 0
        ? ((leadsCapture / totalConversations) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
