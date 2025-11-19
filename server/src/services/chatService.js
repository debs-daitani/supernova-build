/**
 * Chat Service
 * Core business logic for live chat system
 */

/**
 * Start a new conversation
 */
async function startConversation(prisma, widgetId, visitorData) {
  try {
    // Get or create visitor
    let visitor = await prisma.chatVisitor.findUnique({
      where: { sessionId: visitorData.sessionId }
    });

    if (!visitor) {
      visitor = await prisma.chatVisitor.create({
        data: {
          sessionId: visitorData.sessionId,
          fingerprint: visitorData.fingerprint,
          name: visitorData.name,
          email: visitorData.email,
          metadata: visitorData.metadata,
          currentPage: visitorData.currentPage,
          pageHistory: [visitorData.currentPage]
        }
      });
    } else {
      // Update visitor activity
      await prisma.chatVisitor.update({
        where: { id: visitor.id },
        data: {
          lastSeen: new Date(),
          currentPage: visitorData.currentPage,
          pageHistory: {
            push: visitorData.currentPage
          },
          pageViews: { increment: 1 }
        }
      });
    }

    // Check for existing active conversation
    const existing = await prisma.chatConversation.findFirst({
      where: {
        widgetId,
        visitorId: visitor.id,
        status: 'ACTIVE'
      }
    });

    if (existing) {
      return { success: true, conversation: existing, isNew: false };
    }

    // Create new conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        widgetId,
        visitorId: visitor.id,
        visitorName: visitorData.name,
        visitorEmail: visitorData.email,
        visitorMetadata: visitorData.metadata,
        status: 'ACTIVE'
      }
    });

    // Update widget stats
    await prisma.chatWidget.update({
      where: { id: widgetId },
      data: {
        totalConversations: { increment: 1 }
      }
    });

    // Send greeting message from bot
    const widget = await prisma.chatWidget.findUnique({
      where: { id: widgetId }
    });

    if (widget && widget.greeting) {
      await sendMessage(prisma, {
        conversationId: conversation.id,
        senderId: 'bot',
        senderType: 'BOT',
        message: widget.greeting
      });
    }

    return { success: true, conversation, isNew: true };
  } catch (error) {
    console.error('Error starting conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a message in a conversation
 */
async function sendMessage(prisma, messageData) {
  try {
    const {
      conversationId,
      senderId,
      senderType,
      senderName,
      userId,
      message,
      attachments = [],
      isInternal = false
    } = messageData;

    // Create message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        senderType,
        senderName,
        userId,
        message,
        attachments,
        isInternal
      }
    });

    // Update conversation
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date()
      }
    });

    // Update widget stats
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { widget: true }
    });

    await prisma.chatWidget.update({
      where: { id: conversation.widgetId },
      data: {
        totalMessages: { increment: 1 }
      }
    });

    // Check for chatbot triggers if message is from visitor
    if (senderType === 'VISITOR') {
      await checkChatbotTriggers(prisma, conversation.widgetId, conversationId, message);
    }

    return { success: true, message: chatMessage };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if message triggers any chatbot rules
 */
async function checkChatbotTriggers(prisma, widgetId, conversationId, message) {
  try {
    const rules = await prisma.chatbotRule.findMany({
      where: {
        widgetId,
        isActive: true
      }
    });

    const messageLower = message.toLowerCase();

    for (const rule of rules) {
      // Check if any keyword matches
      const triggered = rule.keywords.some(keyword =>
        messageLower.includes(keyword.toLowerCase())
      );

      if (triggered) {
        // Send bot response
        await sendMessage(prisma, {
          conversationId,
          senderId: 'bot',
          senderType: 'BOT',
          message: rule.response
        });

        // Update trigger count
        await prisma.chatbotRule.update({
          where: { id: rule.id },
          data: {
            triggerCount: { increment: 1 }
          }
        });

        // Only trigger first matching rule
        break;
      }
    }
  } catch (error) {
    console.error('Error checking chatbot triggers:', error);
  }
}

/**
 * Get conversation with messages
 */
async function getConversation(prisma, conversationId) {
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' }
        },
        visitor: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return { success: true, conversation };
  } catch (error) {
    console.error('Error getting conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List conversations for team inbox
 */
async function listConversations(prisma, filters = {}) {
  try {
    const {
      widgetId,
      status,
      assignedToId,
      limit = 50,
      offset = 0
    } = filters;

    const where = {};
    if (widgetId) where.widgetId = widgetId;
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    const conversations = await prisma.chatConversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1 // Last message only for preview
        },
        visitor: true,
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    const total = await prisma.chatConversation.count({ where });

    return { success: true, conversations, total };
  } catch (error) {
    console.error('Error listing conversations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign conversation to team member
 */
async function assignConversation(prisma, conversationId, userId) {
  try {
    const conversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        assignedToId: userId
      }
    });

    return { success: true, conversation };
  } catch (error) {
    console.error('Error assigning conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Close conversation
 */
async function closeConversation(prisma, conversationId) {
  try {
    const conversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        status: 'CLOSED',
        closedAt: new Date()
      }
    });

    return { success: true, conversation };
  } catch (error) {
    console.error('Error closing conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark messages as read
 */
async function markAsRead(prisma, conversationId, userId) {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
        senderType: 'VISITOR'
      },
      data: {
        isRead: true
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get online visitors
 */
async function getOnlineVisitors(prisma, widgetId) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const visitors = await prisma.chatVisitor.findMany({
      where: {
        lastSeen: {
          gte: fiveMinutesAgo
        },
        conversations: {
          some: {
            widgetId
          }
        }
      },
      orderBy: {
        lastSeen: 'desc'
      }
    });

    return { success: true, visitors };
  } catch (error) {
    console.error('Error getting online visitors:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create canned response
 */
async function createCannedResponse(prisma, userId, data) {
  try {
    const response = await prisma.cannedResponse.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        category: data.category
      }
    });

    return { success: true, response };
  } catch (error) {
    console.error('Error creating canned response:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get canned responses
 */
async function getCannedResponses(prisma, userId) {
  try {
    const responses = await prisma.cannedResponse.findMany({
      where: { userId },
      orderBy: [
        { usageCount: 'desc' },
        { title: 'asc' }
      ]
    });

    return { success: true, responses };
  } catch (error) {
    console.error('Error getting canned responses:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Use canned response (increment count)
 */
async function useCannedResponse(prisma, responseId) {
  try {
    await prisma.cannedResponse.update({
      where: { id: responseId },
      data: {
        usageCount: { increment: 1 }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error using canned response:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create chatbot rule
 */
async function createChatbotRule(prisma, widgetId, data) {
  try {
    const rule = await prisma.chatbotRule.create({
      data: {
        widgetId,
        name: data.name,
        keywords: data.keywords,
        response: data.response,
        isActive: data.isActive !== false
      }
    });

    return { success: true, rule };
  } catch (error) {
    console.error('Error creating chatbot rule:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get chatbot rules
 */
async function getChatbotRules(prisma, widgetId) {
  try {
    const rules = await prisma.chatbotRule.findMany({
      where: { widgetId },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, rules };
  } catch (error) {
    console.error('Error getting chatbot rules:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  startConversation,
  sendMessage,
  getConversation,
  listConversations,
  assignConversation,
  closeConversation,
  markAsRead,
  getOnlineVisitors,
  createCannedResponse,
  getCannedResponses,
  useCannedResponse,
  createChatbotRule,
  getChatbotRules
};
