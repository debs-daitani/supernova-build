'use client';

import { useState, useEffect, useRef } from 'react';

type AIMode = 'BODY' | 'BRAIN' | 'BUSINESS';

type Message = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
  tokensUsed?: number;
};

type Conversation = {
  id: string;
  title: string;
  mode: AIMode;
  messages: Message[];
  createdAt: string;
};

export default function SuperNovaPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AIMode>('BRAIN');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Replace with actual user ID from your auth system
  const userId = 'user-123'; // TODO: Get from authentication

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversationHistory() {
    try {
      // TODO: Implement API endpoint to fetch user's conversations
      // For now, starting fresh
      console.log('Loading conversation history...');
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setLoading(true);
    setUpgradePrompt(false);

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/supernova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId,
          conversationId,
          mode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle tier blocking
        if (response.status === 403 && errorData.upgrade) {
          setError(errorData.message);
          setUpgradePrompt(true);
          setMessages((prev) => prev.slice(0, -1)); // Remove temp user message
          return;
        }

        // Handle quota limit
        if (response.status === 429) {
          setError(errorData.message);
          setUpgradePrompt(errorData.upgrade);
          setUsage({ used: errorData.used, limit: errorData.limit });
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        throw new Error(errorData.error || 'Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      let assistantMessage = '';
      let assistantMessageId = Date.now().toString();

      // Add empty assistant message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'ASSISTANT',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              // FIXED: Changed from parsed.content to parsed.text
              if (parsed.text) {
                assistantMessage += parsed.text;
                // Update assistant message in UI
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantMessage }
                      : msg
                  )
                );
              }

              if (parsed.done) {
                // Stream complete - update conversation ID and usage
                if (parsed.conversationId) {
                  setConversationId(parsed.conversationId);
                }
                if (parsed.usage) {
                  setUsage(parsed.usage);
                }
                if (parsed.tokensUsed) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, tokensUsed: parsed.tokensUsed }
                        : msg
                    )
                  );
                }
              }
            } catch (parseError) {
              console.error('Failed to parse chunk:', data, parseError);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Chat error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function clearConversation() {
    if (confirm('Clear this conversation? This cannot be undone.')) {
      setMessages([]);
      setConversationId(null);
      setError(null);
    }
  }

  function getModeDescription(mode: AIMode): string {
    switch (mode) {
      case 'BODY':
        return '💪 Physical wellness, menopause, perimenopause';
      case 'BRAIN':
        return '🧠 Mental health, ADHD, neurodivergence';
      case 'BUSINESS':
        return '🚀 Business strategy, Anti-Branding, Menopreneur';
    }
  }

  function getModeColor(mode: AIMode): string {
    switch (mode) {
      case 'BODY':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'BRAIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'BUSINESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">✨ SUPERNova AI</h1>
          <p className="text-purple-100">
            Your no-bullshit business coach for midlife entrepreneurs
          </p>
        </div>
      </header>

      {/* Mode Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">AI Mode:</label>
            {usage && (
              <div className="text-sm text-gray-600">
                📊 {usage.used}/{usage.limit} messages used this month
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['BODY', 'BRAIN', 'BUSINESS'] as AIMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                  mode === m
                    ? getModeColor(m) + ' border-current shadow-md'
                    : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="font-bold mb-1">{m}</div>
                <div className="text-xs">{getModeDescription(m)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎸</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Ready to rock your business?
              </h2>
              <p className="text-gray-600">
                Choose your mode above and start your conversation with SUPERNova AI
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'USER'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.tokensUsed && (
                  <div className="text-xs mt-2 opacity-70">
                    {msg.tokensUsed} tokens
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce">●</div>
                  <div className="animate-bounce delay-100">●</div>
                  <div className="animate-bounce delay-200">●</div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="text-red-500 text-xl">⚠️</div>
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
                {upgradePrompt && (
                  <button className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Upgrade Now 🚀
                  </button>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask SUPERNova ${mode}...`}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearConversation}
                disabled={loading}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
