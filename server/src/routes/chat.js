import express from 'express';
import { PrismaClient } from '@prisma/client';
import { processUserMessage } from '../services/chatbotEngine.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// PUBLIC CHAT WIDGET API
// (No auth required - for website visitors)
// ============================================

// Start a new conversation
router.post('/start', async (req, res) => {
  try {
    const { chatbotId, visitorId, pageUrl } = req.body;

    if (!chatbotId || !visitorId) {
      return res.status(400).json({ error: 'Chatbot ID and visitor ID are required' });
    }

    // Get chatbot
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        flows: { where: { active: true } },
        triggers: { where: { active: true } }
      }
    });

    if (!chatbot || !chatbot.enabled) {
      return res.status(404).json({ error: 'Chatbot not found or disabled' });
    }

    // Check if visitor already has an active conversation
    let conversation = await prisma.chatbotConversation.findFirst({
      where: {
        chatbotId,
        visitorId,
        status: 'active'
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50 // Last 50 messages
        }
      }
    });

    // If no active conversation, create new one
    if (!conversation) {
      // Find matching trigger based on page URL or default trigger
      let triggeredFlow = null;

      if (pageUrl) {
        const pageUrlTrigger = chatbot.triggers.find(t => t.triggerType === 'page_url' && pageUrl.includes(t.pageUrl));
        if (pageUrlTrigger) {
          triggeredFlow = chatbot.flows.find(f => f.id === pageUrlTrigger.flowId);
        }
      }

      // If no page URL trigger, use first active flow
      if (!triggeredFlow && chatbot.flows.length > 0) {
        triggeredFlow = chatbot.flows[0];
      }

      // Create conversation
      conversation = await prisma.chatbotConversation.create({
        data: {
          chatbotId,
          visitorId,
          currentFlowId: triggeredFlow?.id,
          currentNodeId: null,
          variables: {},
          status: 'active'
        },
        include: {
          messages: true
        }
      });

      // Send welcome message
      const welcomeMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageType: 'text',
          content: chatbot.welcomeMessage || 'Hi! 👋 How can I help you today?'
        }
      });

      conversation.messages = [welcomeMessage];
    }

    res.json({
      conversationId: conversation.id,
      chatbot: {
        name: chatbot.name,
        avatar: chatbot.avatar,
        primaryColor: chatbot.primaryColor
      },
      messages: conversation.messages
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send a user message
router.post('/:conversationId/message', async (req, res) => {
  try {
    const { content, buttonId } = req.body;
    const { conversationId } = req.params;

    if (!content && !buttonId) {
      return res.status(400).json({ error: 'Message content or button ID is required' });
    }

    // Get conversation
    const conversation = await prisma.chatbotConversation.findUnique({
      where: { id: conversationId },
      include: {
        chatbot: {
          include: {
            flows: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.status !== 'active') {
      return res.status(400).json({ error: 'Conversation is not active' });
    }

    // Save user message
    const userMessage = await prisma.chatbotMessage.create({
      data: {
        conversationId,
        sender: 'user',
        messageType: buttonId ? 'button' : 'text',
        content: content || '',
        selectedButton: buttonId
      }
    });

    // Process message and get bot response
    const botResponse = await processUserMessage(conversationId, content || '', buttonId);

    // Update conversation last message time
    await prisma.chatbotConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    res.json({
      userMessage,
      botMessages: botResponse.messages,
      variables: botResponse.variables,
      status: botResponse.status
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation history
router.get('/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await prisma.chatbotConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      messages: conversation.messages,
      variables: conversation.variables,
      status: conversation.status
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Hand off conversation to SUPERNova AI
router.post('/:conversationId/handoff', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await prisma.chatbotConversation.findUnique({
      where: { id: conversationId },
      include: {
        chatbot: true
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.chatbot.aiHandoffEnabled) {
      return res.status(400).json({ error: 'AI handoff is not enabled for this chatbot' });
    }

    // Update conversation status
    await prisma.chatbotConversation.update({
      where: { id: conversationId },
      data: { status: 'handed_off_to_ai' }
    });

    // Create bot message indicating handoff
    await prisma.chatbotMessage.create({
      data: {
        conversationId,
        sender: 'bot',
        messageType: 'text',
        content: '🤖 Transferring you to SUPERNova AI for more personalized assistance...'
      }
    });

    res.json({
      message: 'Conversation handed off to AI',
      supernova: true
    });
  } catch (error) {
    console.error('Error handing off conversation:', error);
    res.status(500).json({ error: 'Failed to hand off conversation' });
  }
});

// Mark conversation as completed
router.post('/:conversationId/complete', async (req, res) => {
  try {
    const { conversationId } = req.params;

    await prisma.chatbotConversation.update({
      where: { id: conversationId },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    res.json({ message: 'Conversation marked as completed' });
  } catch (error) {
    console.error('Error completing conversation:', error);
    res.status(500).json({ error: 'Failed to complete conversation' });
  }
});

// Check for keyword triggers
router.post('/check-trigger', async (req, res) => {
  try {
    const { chatbotId, keyword } = req.body;

    if (!chatbotId || !keyword) {
      return res.status(400).json({ error: 'Chatbot ID and keyword are required' });
    }

    const triggers = await prisma.chatbotTrigger.findMany({
      where: {
        chatbotId,
        triggerType: 'keyword',
        active: true
      }
    });

    // Find matching trigger
    const matchedTrigger = triggers.find(t =>
      keyword.toLowerCase().includes(t.keyword.toLowerCase())
    );

    if (matchedTrigger) {
      const flow = await prisma.chatbotFlow.findUnique({
        where: { id: matchedTrigger.flowId }
      });

      res.json({
        triggered: true,
        flowId: flow.id,
        flowName: flow.name
      });
    } else {
      res.json({ triggered: false });
    }
  } catch (error) {
    console.error('Error checking trigger:', error);
    res.status(500).json({ error: 'Failed to check trigger' });
  }
});

export default router;
