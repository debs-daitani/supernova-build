import { useState, useEffect } from 'react';
import { supernova } from '../../services/api';
import toast from 'react-hot-toast';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await supernova.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        loadConversation(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const loadConversation = async (id) => {
    try {
      const { data } = await supernova.getConversation(id);
      setActiveConversation(data);
      setMessages(data.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const createNewConversation = async () => {
    try {
      const { data } = await supernova.createConversation();
      setConversations([data, ...conversations]);
      setActiveConversation(data);
      setMessages([]);
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const { data } = await supernova.sendMessage({
        conversationId: activeConversation.id,
        content: userMessage,
      });

      setMessages([...messages, data.userMessage, data.assistantMessage]);
      fetchConversations(); // Refresh to update titles
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Conversations List */}
      <div className="w-64 card overflow-y-auto">
        <button onClick={createNewConversation} className="w-full btn btn-primary mb-4">
          New Chat
        </button>
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                activeConversation?.id === conv.id ? 'bg-primary-50 border border-primary-200' : ''
              }`}
            >
              <div className="text-sm font-medium truncate">{conv.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card flex flex-col">
        {activeConversation ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      msg.role === 'USER'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SUPERNova anything..."
                className="input flex-1"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Create or select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
