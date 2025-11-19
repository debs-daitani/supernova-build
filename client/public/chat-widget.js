/**
 * dAItaniverse Live Chat Widget
 * Embeddable chat widget for websites
 *
 * Usage:
 * <script src="https://daitaniverse.com/chat-widget.js" data-widget-id="WIDGET_12345"></script>
 */

(function() {
  'use strict';

  // Configuration
  const script = document.currentScript;
  const widgetId = script?.dataset.widgetId || script?.getAttribute('data-widget-id');
  const apiUrl = script?.dataset.apiUrl || 'http://localhost:3000/api';
  const wsUrl = script?.dataset.wsUrl || 'ws://localhost:3000';

  if (!widgetId) {
    console.error('Chat Widget: widget-id is required');
    return;
  }

  // State
  let widget = null;
  let conversation = null;
  let messages = [];
  let ws = null;
  let sessionId = getOrCreateSessionId();
  let isOpen = false;
  let isTyping = false;

  /**
   * Initialize widget
   */
  async function init() {
    try {
      // Fetch widget configuration
      const response = await fetch(`${apiUrl}/chat/widgets/embed/${widgetId}`);
      const data = await response.json();

      if (!data.success) {
        console.error('Failed to load chat widget');
        return;
      }

      widget = data.widget;

      // Create widget UI
      createWidgetUI();

      // Connect WebSocket
      connectWebSocket();
    } catch (error) {
      console.error('Error initializing chat widget:', error);
    }
  }

  /**
   * Create widget UI
   */
  function createWidgetUI() {
    const container = document.createElement('div');
    container.id = 'daitani-chat-widget';
    container.innerHTML = `
      <style>
        #daitani-chat-widget {
          position: fixed;
          ${getPositionStyles()}
          z-index: 99999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        #daitani-chat-bubble {
          width: 60px;
          height: 60px;
          background: ${widget.primaryColor};
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        #daitani-chat-bubble:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }

        #daitani-chat-bubble svg {
          width: 30px;
          height: 30px;
          fill: white;
        }

        #daitani-chat-window {
          display: none;
          position: fixed;
          ${getPositionStyles()}
          width: 380px;
          height: 600px;
          max-height: calc(100vh - 100px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          flex-direction: column;
          overflow: hidden;
        }

        #daitani-chat-window.open {
          display: flex;
        }

        #daitani-chat-header {
          background: ${widget.primaryColor};
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        #daitani-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        #daitani-chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        #daitani-chat-title {
          font-weight: 600;
          font-size: 16px;
        }

        #daitani-chat-subtitle {
          font-size: 12px;
          opacity: 0.9;
        }

        #daitani-chat-close {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 24px;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #daitani-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
        }

        .daitani-message {
          margin-bottom: 16px;
          display: flex;
          gap: 8px;
        }

        .daitani-message.visitor {
          flex-direction: row-reverse;
        }

        .daitani-message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .daitani-message.agent .daitani-message-bubble {
          background: white;
          border-bottom-left-radius: 4px;
        }

        .daitani-message.visitor .daitani-message-bubble {
          background: ${widget.primaryColor};
          color: white;
          border-bottom-right-radius: 4px;
        }

        .daitani-message.bot .daitani-message-bubble {
          background: #e3f2fd;
          border-bottom-left-radius: 4px;
        }

        .daitani-message-time {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }

        .daitani-typing {
          display: none;
          padding: 12px 16px;
          background: white;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          width: fit-content;
          margin-bottom: 16px;
        }

        .daitani-typing.show {
          display: block;
        }

        .daitani-typing span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
          margin: 0 2px;
          animation: typing 1.4s infinite;
        }

        .daitani-typing span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .daitani-typing span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }

        #daitani-chat-input-container {
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #eee;
          display: flex;
          gap: 8px;
        }

        #daitani-chat-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 24px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
        }

        #daitani-chat-input:focus {
          border-color: ${widget.primaryColor};
        }

        #daitani-chat-send {
          width: 40px;
          height: 40px;
          background: ${widget.primaryColor};
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }

        #daitani-chat-send:hover {
          opacity: 0.9;
        }

        #daitani-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>

      <!-- Chat Bubble -->
      <div id="daitani-chat-bubble">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>

      <!-- Chat Window -->
      <div id="daitani-chat-window">
        <div id="daitani-chat-header">
          <div id="daitani-chat-header-info">
            <div id="daitani-chat-avatar">💬</div>
            <div>
              <div id="daitani-chat-title">${widget.name || 'Chat Support'}</div>
              <div id="daitani-chat-subtitle">We typically reply in minutes</div>
            </div>
          </div>
          <button id="daitani-chat-close">×</button>
        </div>

        <div id="daitani-chat-messages"></div>

        <div id="daitani-chat-input-container">
          <input
            id="daitani-chat-input"
            type="text"
            placeholder="Type your message..."
            autocomplete="off"
          />
          <button id="daitani-chat-send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Event listeners
    document.getElementById('daitani-chat-bubble').addEventListener('click', openChat);
    document.getElementById('daitani-chat-close').addEventListener('click', closeChat);
    document.getElementById('daitani-chat-send').addEventListener('click', sendMessage);
    document.getElementById('daitani-chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Typing indicator
    document.getElementById('daitani-chat-input').addEventListener('input', () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'typing',
          conversationId: conversation?.id,
          isTyping: true
        }));
      }
    });
  }

  /**
   * Get position styles based on widget config
   */
  function getPositionStyles() {
    const position = widget?.position || 'BOTTOM_RIGHT';
    const base = { bottom: '20px', right: '20px' };

    switch (position) {
      case 'BOTTOM_LEFT':
        return 'bottom: 20px; left: 20px;';
      case 'TOP_RIGHT':
        return 'top: 20px; right: 20px;';
      case 'TOP_LEFT':
        return 'top: 20px; left: 20px;';
      default: // BOTTOM_RIGHT
        return 'bottom: 20px; right: 20px;';
    }
  }

  /**
   * Connect WebSocket
   */
  function connectWebSocket() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Chat WebSocket connected');

      // Initialize visitor connection
      ws.send(JSON.stringify({
        type: 'init_visitor',
        widgetId: widget.id,
        sessionId,
        visitorData: {
          name: null,
          email: null,
          currentPage: window.location.href,
          referrer: document.referrer,
          metadata: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenSize: `${screen.width}x${screen.height}`
          }
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
      // Attempt reconnect after 3 seconds
      setTimeout(() => {
        if (isOpen) connectWebSocket();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };
  }

  /**
   * Handle WebSocket messages
   */
  function handleWebSocketMessage(data) {
    switch (data.type) {
      case 'conversation_init':
        conversation = data.conversation;
        messages = data.conversation.messages || [];
        renderMessages();
        break;

      case 'new_message':
        messages.push(data.message);
        renderMessages();
        playNotificationSound();
        break;

      case 'typing':
        if (data.senderType === 'AGENT') {
          showTypingIndicator(data.isTyping);
        }
        break;
    }
  }

  /**
   * Open chat window
   */
  function openChat() {
    isOpen = true;
    document.getElementById('daitani-chat-window').classList.add('open');
    document.getElementById('daitani-chat-bubble').style.display = 'none';
    document.getElementById('daitani-chat-input').focus();
  }

  /**
   * Close chat window
   */
  function closeChat() {
    isOpen = false;
    document.getElementById('daitani-chat-window').classList.remove('open');
    document.getElementById('daitani-chat-bubble').style.display = 'flex';
  }

  /**
   * Send message
   */
  function sendMessage() {
    const input = document.getElementById('daitani-chat-input');
    const text = input.value.trim();

    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type: 'send_message',
      conversationId: conversation.id,
      text,
      attachments: []
    }));

    input.value = '';
  }

  /**
   * Render messages
   */
  function renderMessages() {
    const container = document.getElementById('daitani-chat-messages');

    container.innerHTML = messages.map(msg => `
      <div class="daitani-message ${msg.senderType.toLowerCase()}">
        <div class="daitani-message-bubble">
          ${escapeHtml(msg.message)}
          <div class="daitani-message-time">
            ${formatTime(msg.sentAt)}
          </div>
        </div>
      </div>
    `).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Show typing indicator
   */
  function showTypingIndicator(show) {
    let indicator = document.querySelector('.daitani-typing');

    if (!indicator && show) {
      const container = document.getElementById('daitani-chat-messages');
      indicator = document.createElement('div');
      indicator.className = 'daitani-typing show';
      indicator.innerHTML = '<span></span><span></span><span></span>';
      container.appendChild(indicator);
      container.scrollTop = container.scrollHeight;
    } else if (indicator) {
      if (show) {
        indicator.classList.add('show');
      } else {
        indicator.classList.remove('show');
        setTimeout(() => indicator.remove(), 300);
      }
    }
  }

  /**
   * Play notification sound
   */
  function playNotificationSound() {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silent fail if audio not supported
    }
  }

  /**
   * Get or create session ID
   */
  function getOrCreateSessionId() {
    let sid = localStorage.getItem('daitani_chat_session');

    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 15) + Date.now();
      localStorage.setItem('daitani_chat_session', sid);
    }

    return sid;
  }

  /**
   * Format time
   */
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
