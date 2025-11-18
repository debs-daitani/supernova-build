import { useState, useEffect, useRef } from 'react';
import { platformConversations, platformMessages, platformStatus } from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function MessagingDashboard() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadStatuses();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
      // Mark as read
      platformConversations.readAll(selectedConv.id).catch(console.error);
    }
  }, [selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await platformConversations.list();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const data = await platformMessages.list(convId, { limit: 100 });
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await platformStatus.list();
      setStatusUpdates(data);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      setSending(true);
      const message = await platformMessages.send(selectedConv.id, {
        content: newMessage.trim(),
        messageType: 'text',
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Update conversation list
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">💬 Messaging Platform</h1>
          <p className="text-blue-200">Communicate with your team and customers in real-time</p>
        </div>

        {/* Status Updates Row */}
        {statusUpdates.length > 0 && (
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {statusUpdates.map(status => (
                <div key={status.id} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-blue-400 p-1 cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <img
                        src={status.user.avatar || '/default-avatar.png'}
                        alt={status.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-white text-xs mt-1 text-center truncate w-16">{status.user.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messaging Interface */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden" style={{ height: '600px' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-4 border-r border-white/20 overflow-y-auto">
              <div className="p-4 border-b border-white/20">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {loading ? (
                <div className="p-8 text-center text-blue-300">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-blue-300 text-sm">No conversations yet</p>
                  <p className="text-blue-400 text-xs mt-1">Start chatting with your team!</p>
                </div>
              ) : (
                <div>
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-4 border-b border-white/10 cursor-pointer transition-all ${
                        selectedConv?.id === conv.id
                          ? 'bg-blue-500/20 border-l-4 border-l-blue-400'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {conv.name ? conv.name[0].toUpperCase() : conv.type === 'group' ? '👥' : '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-semibold truncate">
                              {conv.name || `${conv.type === 'group' ? 'Group' : 'Direct'} Chat`}
                            </h3>
                            <span className="text-blue-300 text-xs flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-blue-200 text-sm truncate">
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages View */}
            <div className="col-span-8 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-white/20 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {selectedConv.name ? selectedConv.name[0].toUpperCase() : '💬'}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {selectedConv.name || `${selectedConv.type === 'group' ? 'Group' : 'Direct'} Chat`}
                          </h3>
                          <p className="text-blue-300 text-xs">
                            {selectedConv.type === 'group' ? `${selectedConv.participants.length} members` : 'Online'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                          📞
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                          📹
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                          ⋮
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-20">
                        <p className="text-6xl mb-4">💬</p>
                        <p className="text-blue-300">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMe = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                              {!isMe && (
                                <p className="text-blue-300 text-xs mb-1 ml-2">{msg.sender?.name}</p>
                              )}
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isMe
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                    : 'bg-white/20 text-white'
                                }`}
                              >
                                {msg.isDeleted ? (
                                  <p className="italic text-sm opacity-70">Message deleted</p>
                                ) : (
                                  <>
                                    {msg.replyTo && (
                                      <div className="text-xs opacity-70 mb-1 pb-1 border-b border-white/20">
                                        Replying to {msg.replyTo.sender?.name}: {msg.replyTo.content?.substring(0, 50)}
                                      </div>
                                    )}
                                    <p>{msg.content}</p>
                                    {msg.isEdited && <span className="text-xs opacity-70 ml-2">(edited)</span>}
                                  </>
                                )}
                              </div>
                              <p className="text-blue-400 text-xs mt-1 ml-2">
                                {formatTime(msg.createdAt)}
                                {isMe && msg.readBy?.length > 1 && ' ✓✓'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 bg-white/5">
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        😊
                      </button>
                      <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        📎
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors text-white disabled:opacity-50"
                      >
                        {sending ? '⏳' : '📤'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-8xl mb-4">💬</p>
                    <h3 className="text-white text-2xl font-bold mb-2">Welcome to Messaging</h3>
                    <p className="text-blue-300 mb-6">
                      Select a conversation to start chatting
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all">
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
