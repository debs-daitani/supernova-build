import { useState, useEffect, useRef } from 'react';
import { chatWidget } from '../services/api';

/**
 * Embeddable Chat Widget
 * This component can be embedded on any website to provide chatbot functionality
 *
 * Usage:
 * <ChatWidget chatbotId="your-chatbot-id" />
 */
export default function ChatWidget({ chatbotId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatbot, setChatbot] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate or retrieve visitor ID
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('chatbot_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('chatbot_visitor_id', visitorId);
    }
    return visitorId;
  };

  // Start conversation when widget opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      startConversation();
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const visitorId = getVisitorId();
      const response = await chatWidget.start({
        chatbotId,
        visitorId,
        pageUrl: window.location.href
      });

      setConversationId(response.data.conversationId);
      setChatbot(response.data.chatbot);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setMessages([{
        id: 'error',
        sender: 'bot',
        content: 'Sorry, I\'m having trouble connecting. Please try again later.',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    const userMessage = {
      id: 'temp_' + Date.now(),
      sender: 'user',
      content: inputValue,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWidget.sendMessage(conversationId, {
        content: inputValue
      });

      // Add bot response messages
      if (response.data.botMessages) {
        setMessages(prev => [
          ...prev.filter(m => m.id !== userMessage.id),
          response.data.userMessage,
          ...response.data.botMessages
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: 'error_' + Date.now(),
        sender: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = async (buttonId) => {
    setIsLoading(true);
    try {
      const response = await chatWidget.sendMessage(conversationId, {
        buttonId
      });

      if (response.data.botMessages) {
        setMessages(prev => [
          ...prev,
          response.data.userMessage,
          ...response.data.botMessages
        ]);
      }
    } catch (error) {
      console.error('Error clicking button:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = chatbot?.primaryColor || '#FF1493';

  // Minimized button
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
          className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform animate-bounce"
          style={{ backgroundColor: primaryColor }}
        >
          💬
        </button>
      </div>
    );
  }

  // Full chat window
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="p-4 text-white flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            {chatbot?.avatar && (
              <img
                src={chatbot.avatar}
                alt="Bot"
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            )}
            <div>
              <div className="font-bold">{chatbot?.name || 'Chatbot'}</div>
              <div className="text-xs opacity-90">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              —
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(true);
              }}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`} style={msg.sender === 'user' ? { backgroundColor: primaryColor } : {}}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                  {/* Button options */}
                  {msg.buttonOptions && msg.buttonOptions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.buttonOptions.map((btn, btnIdx) => (
                        <button
                          key={btnIdx}
                          onClick={() => handleButtonClick(btn.id)}
                          className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                          disabled={isLoading}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ focusRingColor: primaryColor }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
              disabled={isLoading || !inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
