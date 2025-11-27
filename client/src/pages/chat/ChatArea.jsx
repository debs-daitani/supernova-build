import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { formatDate, getPillarIcon } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatArea({
  conversation,
  messages,
  loading,
  streaming,
  onSendMessage,
  onUpdateConversation,
  sidebarOpen,
  onToggleSidebar,
}) {
  const [input, setInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || streaming) return;

    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTitleEdit = () => {
    if (!conversation) return;
    setEditedTitle(conversation.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== conversation?.title) {
      onUpdateConversation({ title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-heading font-bold mb-2">
            Welcome to SUPERNova AI
          </h2>
          <p className="text-gray-600 mb-6">
            Start a conversation to unlock your potential
          </p>
          <Button onClick={() => window.location.reload()}>
            Create New Conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ☰
            </button>
          )}

          {conversation.pillar && (
            <span className="text-2xl">{getPillarIcon(conversation.pillar)}</span>
          )}

          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="text-lg font-semibold border-b-2 border-primary outline-none px-2 py-1"
              autoFocus
            />
          ) : (
            <h2
              className="text-lg font-semibold cursor-pointer hover:text-primary"
              onClick={handleTitleEdit}
            >
              {conversation.title}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">
                {getPillarIcon(conversation.pillar) || '✨'}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Start the Conversation
              </h3>
              <p className="text-gray-600 mb-6">
                Ask me anything about {conversation.pillar || 'any topic'}. I'm here to help you achieve your goals!
              </p>
              <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Try asking:</p>
                <p className="text-gray-700">
                  • "How can I improve my morning routine?"
                </p>
                <p className="text-gray-700">
                  • "Help me create a marketing strategy"
                </p>
                <p className="text-gray-700">
                  • "What are good ADHD productivity tips?"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                streaming
                  ? 'SUPERNova is typing...'
                  : 'Type your message... (Enter to send, Shift+Enter for new line)'
              }
              disabled={streaming}
              className="flex-1 resize-none max-h-32"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              size="icon"
              className="self-end h-10 w-10"
            >
              {streaming ? '⏸' : '➤'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            SUPERNova AI remembers your preferences and adapts to your needs
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        <p
          className={`text-xs mt-2 ${
            isUser ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          {formatDate(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
