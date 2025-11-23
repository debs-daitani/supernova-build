'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Zap, Brain, Heart, TrendingUp, Sparkles } from 'lucide-react'

type CoachingMode = 'GENERAL' | 'BODY' | 'BRAIN' | 'BUSINESS'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const MODE_CONFIG = {
  GENERAL: {
    icon: Sparkles,
    label: 'General',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500',
  },
  BODY: {
    icon: Heart,
    label: 'Body',
    color: 'from-red-500 to-orange-500',
    bg: 'bg-red-500',
  },
  BRAIN: {
    icon: Brain,
    label: 'Brain',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500',
  },
  BUSINESS: {
    icon: TrendingUp,
    label: 'Business',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500',
  },
}

export default function SuperNovaChat() {
  const [mode, setMode] = useState<CoachingMode>('GENERAL')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Mock userId - in production, get from auth
  const userId = 'demo-user-1'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          userId,
          mode,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.text) {
                accumulatedText += data.text
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                )
              }

              if (data.done) {
                setConversationId(data.conversationId)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  'Sorry, something went wrong. Please try again.',
              }
            : msg
        )
      )
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const ModeIcon = MODE_CONFIG[mode].icon

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${MODE_CONFIG[mode].color}`}>
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SUPERNova AI</h1>
                <p className="text-sm text-gray-400">
                  Your intelligent coaching assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Selector */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            {(Object.keys(MODE_CONFIG) as CoachingMode[]).map((m) => {
              const Icon = MODE_CONFIG[m].icon
              const isActive = mode === m
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? `${MODE_CONFIG[m].bg} text-white`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {MODE_CONFIG[m].label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${MODE_CONFIG[mode].color} mb-4`}>
                <ModeIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to transform?
              </h2>
              <p className="text-gray-400 mb-8">
                {mode === 'BODY' && 'Let\'s optimize your health and energy.'}
                {mode === 'BRAIN' && 'Let\'s work with your ADHD brain, not against it.'}
                {mode === 'BUSINESS' && 'Let\'s build a business that serves your life.'}
                {mode === 'GENERAL' && 'Choose a mode or ask me anything.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? `${MODE_CONFIG[mode].bg} text-white`
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.role === 'assistant' && isStreaming && msg.content === '' && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={1}
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                !input.trim() || isStreaming
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : `bg-gradient-to-br ${MODE_CONFIG[mode].color} text-white hover:opacity-90`
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            SUPERNova AI • {MODE_CONFIG[mode].label} Mode • Powered by Claude
          </p>
        </div>
      </div>
    </div>
  )
}
