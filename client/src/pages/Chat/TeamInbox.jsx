/**
 * Team Inbox
 * Dashboard for managing live chat conversations
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const STATUS_FILTERS = [
  { value: 'ACTIVE', label: 'Active', count: 0 },
  { value: 'CLOSED', label: 'Closed', count: 0 },
  { value: 'assigned', label: 'Assigned to Me', count: 0 }
];

export default function TeamInbox() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cannedResponses, setCannedResponses] = useState([]);
  const [showCanned, setShowCanned] = useState(false);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadCannedResponses();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [statusFilter]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Initialize as agent
      ws.send(JSON.stringify({
        type: 'init_agent',
        userId: 'current_user_id', // Get from auth
        conversationId: conversationId || null
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_conversation':
        loadConversations();
        break;

      case 'new_message':
        if (selectedConversation && data.message.conversationId === selectedConversation.id) {
          setMessages(prev => [...prev, data.message]);
        }
        loadConversations(); // Refresh list
        break;

      case 'typing':
        if (data.senderType === 'VISITOR' && data.conversationId === selectedConversation?.id) {
          setIsTyping(data.isTyping);
        }
        break;
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter === 'assigned') {
        params.append('assignedToMe', 'true');
      } else {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/chat/conversations?${params}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const response = await fetch(`/api/chat/conversations/${id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedConversation(data.conversation);
        setMessages(data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadCannedResponses = async () => {
    try {
      const response = await fetch('/api/chat/canned-responses');
      const data = await response.json();

      if (data.success) {
        setCannedResponses(data.responses);
      }
    } catch (error) {
      console.error('Error loading canned responses:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageInput
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const closeConversation = async () => {
    if (!selectedConversation) return;

    try {
      await fetch(`/api/chat/conversations/${selectedConversation.id}/close`, {
        method: 'POST'
      });

      loadConversations();
      setSelectedConversation(null);
      setMessages([]);
      navigate('/chat');
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  const useCannedResponse = (response) => {
    setMessageInput(response.message);
    setShowCanned(false);

    // Track usage
    fetch(`/api/chat/canned-responses/${response.id}/use`, {
      method: 'POST'
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar - Conversation List */}
      <div className="w-96 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold mb-4">Team Inbox</h1>

          {/* Status Filters */}
          <div className="flex gap-2">
            {STATUS_FILTERS.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`flex-1 px-3 py-2 rounded text-sm ${
                  statusFilter === filter.value
                    ? 'bg-orange-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No conversations</div>
          ) : (
            conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversation?.id === conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  loadConversation(conv.id);
                  navigate(`/chat/${conv.id}`);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content - Messages */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {selectedConversation.visitorName || selectedConversation.visitorEmail || 'Anonymous'}
              </h2>
              <p className="text-sm text-gray-400">
                {selectedConversation.visitorEmail}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeConversation}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
              >
                Close Conversation
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <Message key={msg.id} message={msg} />
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                Visitor is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            {showCanned && (
              <div className="mb-3 max-h-40 overflow-y-auto bg-gray-700 rounded">
                {cannedResponses.map(response => (
                  <button
                    key={response.id}
                    onClick={() => useCannedResponse(response)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-600 border-b border-gray-600"
                  >
                    <div className="font-bold text-sm">{response.title}</div>
                    <div className="text-sm text-gray-400 truncate">{response.message}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowCanned(!showCanned)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                title="Canned Responses"
              >
                💬
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
              />

              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p>Select a conversation to view messages</p>
          </div>
        </div>
      )}

      {/* Right Sidebar - Visitor Info */}
      {selectedConversation && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="font-bold mb-4">Visitor Info</h3>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400">Name</div>
              <div>{selectedConversation.visitorName || 'Not provided'}</div>
            </div>

            <div>
              <div className="text-sm text-gray-400">Email</div>
              <div>{selectedConversation.visitorEmail || 'Not provided'}</div>
            </div>

            <div>
              <div className="text-sm text-gray-400">Started</div>
              <div>{new Date(selectedConversation.startedAt).toLocaleString()}</div>
            </div>

            {selectedConversation.visitorMetadata && (
              <div>
                <div className="text-sm text-gray-400">Current Page</div>
                <div className="text-sm break-all">
                  {selectedConversation.visitorMetadata.currentPage}
                </div>
              </div>
            )}

            {selectedConversation.visitor && (
              <div>
                <div className="text-sm text-gray-400">Page Views</div>
                <div>{selectedConversation.visitor.pageViews}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationItem({ conversation, isSelected, onClick }) {
  const lastMessage = conversation.messages?.[0];
  const unreadCount = conversation.messages?.filter(m => !m.isRead && m.senderType === 'VISITOR').length || 0;

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 ${
        isSelected ? 'bg-gray-700' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-bold truncate flex-1">
          {conversation.visitorName || conversation.visitorEmail || 'Anonymous'}
        </div>
        {unreadCount > 0 && (
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {lastMessage && (
        <div className="text-sm text-gray-400 truncate">
          {lastMessage.message}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-1">
        {new Date(conversation.lastMessageAt).toLocaleString()}
      </div>
    </div>
  );
}

function Message({ message }) {
  const isAgent = message.senderType === 'AGENT';
  const isBot = message.senderType === 'BOT';

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-3 rounded-lg ${
          isAgent
            ? 'bg-orange-500 text-white rounded-br-none'
            : isBot
            ? 'bg-blue-500/20 border border-blue-500/30 rounded-bl-none'
            : 'bg-gray-700 rounded-bl-none'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.message}</div>
        <div className="text-xs opacity-75 mt-1">
          {new Date(message.sentAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
