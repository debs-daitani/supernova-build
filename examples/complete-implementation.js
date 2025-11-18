/**
 * SUPERNova AI - Complete Implementation Example
 *
 * This file demonstrates how to integrate all components of the memory system
 * in a Wix environment for a complete AI chatbot implementation.
 */

// Import Wix modules (these are available in Wix Velo environment)
import wixData from 'wix-data';
import { currentMember } from 'wix-members';

// Import your backend services
import { getOrCreateSession, updateSessionActivity, addToWorkingMemory } from 'backend/sessionService';
import { createConversation, getUserConversations, updateConversation } from 'backend/conversationService';
import { storeMessage, getRecentMessages, buildConversationContext } from 'backend/memoryService';

// ============================================================================
// Page Initialization
// ============================================================================

$w.onReady(async function () {
  console.log('SUPERNova AI Chat - Initializing...');

  try {
    // Get current user
    const member = await currentMember.getMember();

    if (!member) {
      console.log('User not logged in');
      showLoginPrompt();
      return;
    }

    const userId = member._id;

    // Initialize chat system
    await initializeChat(userId);

    // Set up event handlers
    setupEventHandlers(userId);

    console.log('Chat initialized successfully');
  } catch (error) {
    console.error('Error initializing chat:', error);
    showError('Failed to initialize chat. Please refresh the page.');
  }
});

// ============================================================================
// Chat Initialization
// ============================================================================

/**
 * Initialize the chat system for a user
 */
async function initializeChat(userId) {
  try {
    // Get or create active session
    const session = await getOrCreateSession(userId);
    console.log('Session:', session.sessionId);

    // Store session in page state
    $w('#chatBox').data = { session };

    // Load or create conversation
    let conversation;
    if (session.conversationId) {
      // Resume existing conversation
      conversation = await loadConversation(session.conversationId);
    } else {
      // Check for recent conversations
      const recentConversations = await getUserConversations(userId, {
        status: 'active',
        limit: 1
      });

      if (recentConversations.length > 0) {
        // Resume most recent conversation
        conversation = recentConversations[0];
      } else {
        // Create new conversation
        conversation = await createConversation({
          userId,
          title: 'New Conversation'
        });
      }

      // Update session with conversation
      await updateSessionActivity(session.sessionId, {
        conversationId: conversation.conversationId
      });
    }

    // Store conversation in page state
    $w('#chatBox').data = {
      ...$w('#chatBox').data,
      conversation
    };

    // Load and display messages
    await loadMessages(conversation.conversationId);

    // Update UI
    updateChatHeader(conversation);
  } catch (error) {
    console.error('Error initializing chat:', error);
    throw error;
  }
}

/**
 * Load conversation details
 */
async function loadConversation(conversationId) {
  // In a real implementation, you would call your backend service
  // For now, we'll query directly
  const results = await wixData.query('SupernovaConversations')
    .eq('conversationId', conversationId)
    .find();

  return results.items.length > 0 ? results.items[0] : null;
}

/**
 * Load and display messages
 */
async function loadMessages(conversationId) {
  try {
    const messages = await getRecentMessages(conversationId, 50);

    // Clear existing messages
    $w('#messageRepeater').data = [];

    // Display messages
    displayMessages(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    showError('Failed to load conversation history.');
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Set up event handlers for chat interactions
 */
function setupEventHandlers(userId) {
  // Send button click
  $w('#sendButton').onClick(() => handleSendMessage(userId));

  // Enter key in input field
  $w('#messageInput').onKeyPress((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(userId);
    }
  });

  // New conversation button
  $w('#newConversationButton').onClick(() => handleNewConversation(userId));

  // Clear conversation button
  $w('#clearButton').onClick(() => handleClearConversation());

  // Message repeater item ready
  $w('#messageRepeater').onItemReady(($item, itemData) => {
    renderMessage($item, itemData);
  });
}

/**
 * Handle sending a message
 */
async function handleSendMessage(userId) {
  try {
    const input = $w('#messageInput');
    const messageContent = input.value.trim();

    if (!messageContent) {
      return;
    }

    // Disable input while processing
    input.disable();
    $w('#sendButton').disable();

    // Get current session and conversation
    const { session, conversation } = $w('#chatBox').data;

    // Create and display user message
    const userMessage = {
      conversationId: conversation.conversationId,
      userId,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    // Display immediately for better UX
    displayMessage(userMessage);

    // Clear input
    input.value = '';

    // Store message in database
    const storedUserMessage = await storeMessage(userMessage);

    // Update session working memory
    await addToWorkingMemory(session.sessionId, storedUserMessage);

    // Build context for AI
    const context = await buildConversationContext(
      userId,
      conversation.conversationId,
      {
        limit: 20,
        knowledgeCategories: ['fact', 'preference']
      }
    );

    // Get AI response
    const aiResponse = await getAIResponse(context, messageContent);

    // Store AI response
    const assistantMessage = await storeMessage({
      conversationId: conversation.conversationId,
      userId,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Display AI response
    displayMessage(assistantMessage);

    // Update session
    await updateSessionActivity(session.sessionId);
    await addToWorkingMemory(session.sessionId, assistantMessage);

    // Auto-generate title if this is the first message
    if (conversation.messageCount === 0) {
      const title = messageContent.substring(0, 50);
      await updateConversation(conversation.conversationId, { title });
      updateChatHeader({ ...conversation, title });
    }

    // Re-enable input
    input.enable();
    $w('#sendButton').enable();
    input.focus();
  } catch (error) {
    console.error('Error sending message:', error);
    showError('Failed to send message. Please try again.');

    // Re-enable input
    $w('#messageInput').enable();
    $w('#sendButton').enable();
  }
}

/**
 * Handle creating a new conversation
 */
async function handleNewConversation(userId) {
  try {
    const { session } = $w('#chatBox').data;

    // Create new conversation
    const conversation = await createConversation({
      userId,
      title: 'New Conversation'
    });

    // Update session
    await updateSessionActivity(session.sessionId, {
      conversationId: conversation.conversationId
    });

    // Update page state
    $w('#chatBox').data = {
      session,
      conversation
    };

    // Clear messages
    $w('#messageRepeater').data = [];

    // Update UI
    updateChatHeader(conversation);

    // Focus input
    $w('#messageInput').focus();
  } catch (error) {
    console.error('Error creating new conversation:', error);
    showError('Failed to create new conversation.');
  }
}

/**
 * Handle clearing conversation
 */
async function handleClearConversation() {
  const confirm = await showConfirmDialog(
    'Clear Conversation',
    'Are you sure you want to clear this conversation? This cannot be undone.'
  );

  if (confirm) {
    $w('#messageRepeater').data = [];
  }
}

// ============================================================================
// UI Functions
// ============================================================================

/**
 * Display multiple messages
 */
function displayMessages(messages) {
  const currentData = $w('#messageRepeater').data || [];
  const newData = messages.map(msg => ({
    _id: msg.messageId || msg._id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    isUser: msg.role === 'user'
  }));

  $w('#messageRepeater').data = [...currentData, ...newData];

  // Scroll to bottom
  scrollToBottom();
}

/**
 * Display a single message
 */
function displayMessage(message) {
  displayMessages([message]);
}

/**
 * Render individual message in repeater
 */
function renderMessage($item, itemData) {
  // Set message text
  $item('#messageText').text = itemData.content;

  // Set timestamp
  const timeStr = formatTimestamp(itemData.timestamp);
  $item('#messageTime').text = timeStr;

  // Style based on role
  if (itemData.isUser) {
    $item('#messageContainer').style.backgroundColor = '#007AFF';
    $item('#messageText').style.color = '#FFFFFF';
    $item('#messageContainer').style.alignSelf = 'flex-end';
  } else {
    $item('#messageContainer').style.backgroundColor = '#F0F0F0';
    $item('#messageText').style.color = '#000000';
    $item('#messageContainer').style.alignSelf = 'flex-start';
  }
}

/**
 * Update chat header with conversation info
 */
function updateChatHeader(conversation) {
  $w('#conversationTitle').text = conversation.title || 'New Conversation';
  $w('#messageCount').text = `${conversation.messageCount || 0} messages`;
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
  setTimeout(() => {
    $w('#chatBox').scrollTo(0, $w('#chatBox').scrollHeight);
  }, 100);
}

/**
 * Show error message
 */
function showError(message) {
  $w('#errorText').text = message;
  $w('#errorBox').show();

  setTimeout(() => {
    $w('#errorBox').hide();
  }, 5000);
}

/**
 * Show login prompt
 */
function showLoginPrompt() {
  $w('#loginPrompt').show();
  $w('#chatBox').hide();
}

/**
 * Show confirm dialog
 */
async function showConfirmDialog(title, message) {
  // In a real implementation, you would use Wix's modal or custom dialog
  return confirm(message);
}

// ============================================================================
// AI Integration (Example)
// ============================================================================

/**
 * Get AI response (placeholder - integrate with your AI service)
 */
async function getAIResponse(context, userMessage) {
  // This is where you would call your AI service (OpenAI, Claude, etc.)
  // For demonstration, we'll return a simple response

  try {
    // Example: Call your backend AI service
    // const response = await callAIService(context, userMessage);

    // For now, return a placeholder response
    return `I received your message: "${userMessage}". This is where the AI response would be generated based on the conversation context.`;

    // Real implementation example with fetch:
    /*
    const response = await fetch('https://api.your-ai-service.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        messages: context.recentMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        userPreferences: context.preferences,
        knowledge: context.knowledge
      })
    });

    const data = await response.json();
    return data.response;
    */
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'I apologize, but I encountered an error processing your message. Please try again.';
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}

/**
 * Estimate reading time for message
 */
function estimateReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

// ============================================================================
// Export for Wix
// ============================================================================

export {
  initializeChat,
  handleSendMessage,
  handleNewConversation,
  displayMessage,
  getAIResponse
};
