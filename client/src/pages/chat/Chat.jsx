import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import toast from 'react-hot-toast';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (id) {
      loadConversation(id);
    } else {
      // Create new conversation if no ID
      createNewConversation();
    }
  }, [id]);

  const fetchConversations = async () => {
    try {
      const response = await conversationsAPI.getAll();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    setLoading(true);
    try {
      const response = await conversationsAPI.getById(conversationId);
      setCurrentConversation(response.data.conversation);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (pillar = null) => {
    try {
      const response = await conversationsAPI.create({
        title: 'New Conversation',
        pillar,
      });
      const newConv = response.data.conversation;
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv);
      setMessages([]);
      navigate(`/chat/${newConv.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const sendMessage = async (content) => {
    if (!currentConversation || !content.trim()) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, userMessage]);

    // Start streaming
    setStreaming(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/conversations/${currentConversation.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.content) {
                aiMessage.content += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...aiMessage };
                  return newMessages;
                });
              }

              if (data.done) {
                setStreaming(false);
                fetchConversations(); // Refresh conversation list
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setStreaming(false);
    }
  };

  const updateConversation = async (updates) => {
    if (!currentConversation) return;

    try {
      await conversationsAPI.update(currentConversation.id, updates);
      setCurrentConversation({ ...currentConversation, ...updates });
      fetchConversations(); // Refresh list
    } catch (error) {
      console.error('Failed to update conversation:', error);
      toast.error('Failed to update conversation');
    }
  };

  const deleteConversation = async (convId) => {
    try {
      await conversationsAPI.delete(convId);
      setConversations(conversations.filter((c) => c.id !== convId));

      if (currentConversation?.id === convId) {
        navigate('/chat');
      }

      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id}
        onNewConversation={createNewConversation}
        onSelectConversation={(conv) => navigate(`/chat/${conv.id}`)}
        onDeleteConversation={deleteConversation}
        onUpdateConversation={updateConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Chat Area */}
      <ChatArea
        conversation={currentConversation}
        messages={messages}
        loading={loading}
        streaming={streaming}
        onSendMessage={sendMessage}
        onUpdateConversation={updateConversation}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
