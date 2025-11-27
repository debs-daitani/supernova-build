/**
 * Chat WebSocket Handler
 * Real-time messaging using WebSockets
 */

const chatService = require('./chatService');

// Store active connections
const connections = new Map(); // conversationId -> Set of WebSocket connections
const visitorConnections = new Map(); // sessionId -> WebSocket
const agentConnections = new Map(); // userId -> WebSocket

/**
 * Initialize WebSocket server
 */
function initializeWebSocket(wss, prisma) {
  console.log('🔌 Initializing chat WebSocket server...');

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    let connectionInfo = {
      type: null, // 'visitor' or 'agent'
      id: null,
      conversationId: null
    };

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);

        switch (message.type) {
          case 'init_visitor':
            await handleVisitorInit(ws, message, connectionInfo, prisma);
            break;

          case 'init_agent':
            await handleAgentInit(ws, message, connectionInfo);
            break;

          case 'send_message':
            await handleSendMessage(ws, message, connectionInfo, prisma);
            break;

          case 'typing':
            handleTyping(message, connectionInfo);
            break;

          case 'read':
            await handleRead(message, connectionInfo, prisma);
            break;

          case 'assign':
            await handleAssign(message, connectionInfo, prisma);
            break;

          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    });

    ws.on('close', () => {
      handleDisconnect(connectionInfo);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('✓ Chat WebSocket server initialized');
}

/**
 * Handle visitor initialization
 */
async function handleVisitorInit(ws, message, connectionInfo, prisma) {
  const { widgetId, sessionId, visitorData } = message;

  connectionInfo.type = 'visitor';
  connectionInfo.id = sessionId;

  // Store visitor connection
  visitorConnections.set(sessionId, ws);

  // Start or resume conversation
  const result = await chatService.startConversation(prisma, widgetId, {
    sessionId,
    ...visitorData
  });

  if (result.success) {
    connectionInfo.conversationId = result.conversation.id;

    // Add to conversation connections
    if (!connections.has(result.conversation.id)) {
      connections.set(result.conversation.id, new Set());
    }
    connections.get(result.conversation.id).add(ws);

    // Send conversation data to visitor
    const conversationData = await chatService.getConversation(prisma, result.conversation.id);

    ws.send(JSON.stringify({
      type: 'conversation_init',
      conversation: conversationData.conversation
    }));

    // Notify agents of new conversation
    if (result.isNew) {
      broadcastToAgents({
        type: 'new_conversation',
        conversation: result.conversation
      });
    }
  }
}

/**
 * Handle agent initialization
 */
function handleAgentInit(ws, message, connectionInfo) {
  const { userId, conversationId } = message;

  connectionInfo.type = 'agent';
  connectionInfo.id = userId;
  connectionInfo.conversationId = conversationId;

  // Store agent connection
  agentConnections.set(userId, ws);

  // Add to conversation connections
  if (conversationId) {
    if (!connections.has(conversationId)) {
      connections.set(conversationId, new Set());
    }
    connections.get(conversationId).add(ws);
  }

  ws.send(JSON.stringify({
    type: 'agent_connected',
    userId
  }));
}

/**
 * Handle sending a message
 */
async function handleSendMessage(ws, message, connectionInfo, prisma) {
  const { conversationId, text, attachments } = message;

  const result = await chatService.sendMessage(prisma, {
    conversationId,
    senderId: connectionInfo.id,
    senderType: connectionInfo.type === 'visitor' ? 'VISITOR' : 'AGENT',
    userId: connectionInfo.type === 'agent' ? connectionInfo.id : null,
    message: text,
    attachments: attachments || []
  });

  if (result.success) {
    // Broadcast to all connections in this conversation
    broadcastToConversation(conversationId, {
      type: 'new_message',
      message: result.message
    });
  }
}

/**
 * Handle typing indicator
 */
function handleTyping(message, connectionInfo) {
  const { conversationId, isTyping } = message;

  broadcastToConversation(conversationId, {
    type: 'typing',
    senderId: connectionInfo.id,
    senderType: connectionInfo.type,
    isTyping
  }, connectionInfo.id); // Exclude sender
}

/**
 * Handle read receipt
 */
async function handleRead(message, connectionInfo, prisma) {
  const { conversationId } = message;

  await chatService.markAsRead(prisma, conversationId, connectionInfo.id);

  broadcastToConversation(conversationId, {
    type: 'read',
    conversationId,
    readBy: connectionInfo.id
  });
}

/**
 * Handle conversation assignment
 */
async function handleAssign(message, connectionInfo, prisma) {
  const { conversationId, userId } = message;

  const result = await chatService.assignConversation(prisma, conversationId, userId);

  if (result.success) {
    broadcastToConversation(conversationId, {
      type: 'assigned',
      conversationId,
      assignedTo: userId
    });

    broadcastToAgents({
      type: 'conversation_assigned',
      conversationId,
      assignedTo: userId
    });
  }
}

/**
 * Handle disconnect
 */
function handleDisconnect(connectionInfo) {
  console.log('WebSocket disconnected:', connectionInfo.type, connectionInfo.id);

  if (connectionInfo.type === 'visitor') {
    visitorConnections.delete(connectionInfo.id);
  } else if (connectionInfo.type === 'agent') {
    agentConnections.delete(connectionInfo.id);
  }

  // Remove from conversation connections
  if (connectionInfo.conversationId) {
    const convConnections = connections.get(connectionInfo.conversationId);
    if (convConnections) {
      convConnections.forEach(conn => {
        if (conn.readyState !== conn.OPEN) {
          convConnections.delete(conn);
        }
      });

      if (convConnections.size === 0) {
        connections.delete(connectionInfo.conversationId);
      }
    }
  }
}

/**
 * Broadcast message to all connections in a conversation
 */
function broadcastToConversation(conversationId, data, excludeId = null) {
  const convConnections = connections.get(conversationId);

  if (!convConnections) return;

  const messageStr = JSON.stringify(data);

  convConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Broadcast message to all agents
 */
function broadcastToAgents(data) {
  const messageStr = JSON.stringify(data);

  agentConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Send message to specific visitor
 */
function sendToVisitor(sessionId, data) {
  const ws = visitorConnections.get(sessionId);

  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

/**
 * Send message to specific agent
 */
function sendToAgent(userId, data) {
  const ws = agentConnections.get(userId);

  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

module.exports = {
  initializeWebSocket,
  broadcastToConversation,
  broadcastToAgents,
  sendToVisitor,
  sendToAgent
};
