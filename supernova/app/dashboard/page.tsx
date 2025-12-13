'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Send, LogOut, User, MessageSquare, Plus } from 'lucide-react'
import VoiceRecorder from '../../components/VoiceRecorder'

type CoachingMode = 'GENERAL' | 'BODY' | 'BRAIN' | 'BUSINESS'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UserData {
  id: string
  email: string
  name: string | null
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [mode, setMode] = useState<CoachingMode>('GENERAL')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Load conversation from URL param after auth is complete
  useEffect(() => {
    const conversationParam = searchParams.get('conversation')
    if (conversationParam && user && !isLoadingAuth) {
      loadConversation(conversationParam)
    }
  }, [searchParams, user, isLoadingAuth])

  const loadConversation = async (convId: string) => {
    setIsLoadingConversation(true)
    try {
      const response = await fetch(`/api/conversations/${convId}`)
      if (response.ok) {
        const data = await response.json()
        setConversationId(convId)
        setMode(data.mode || 'GENERAL')
        // Convert database messages to local format
        const loadedMessages: Message[] = data.messages.map((msg: { id: string; role: string; content: string; createdAt: string }) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }))
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

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
          userId: user.id,
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

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    setMode('GENERAL')
  }

  const handleTranscriptionComplete = (transcription: string) => {
    // Transcription is already saved as a message by the API
    // Just trigger a reload of the chat to get the AI response
    // The transcription was added as a user message, so we need to get AI response
    if (user) {
      // Send empty message to trigger AI response to the transcription
      handleSendTranscription(transcription)
    }
  }

  const handleSendTranscription = async (transcription: string) => {
    if (!user) return

    setIsStreaming(true)

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
          message: transcription,
          conversationId,
          userId: user.id,
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
            ? { ...msg, content: 'Sorry, something went wrong. Please try again.' }
            : msg
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  if (isLoadingAuth || isLoadingConversation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-hot-pink to-light-teal shadow-[0_0_40px_rgba(255,0,142,0.6)] mb-4 animate-pulse">
            <span className="text-4xl font-supernova text-white">SN</span>
          </div>
          <p className="text-gray-400 font-josefin font-semibold">
            {isLoadingConversation ? 'Loading conversation...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        backgroundImage: "url('/images/dAitaniverse Stage.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Left Sidebar */}
      <aside className="w-80 flex flex-col backdrop-blur-xl bg-dark-teal/40 border-r border-light-teal/20 shadow-2xl">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-light-teal/20">
          <h1 className="text-3xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime mb-2">
            SUPERNova
          </h1>
          <p className="text-sm text-gray-300 font-josefin">
            AI Coaching Platform
          </p>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-hot-pink hover:bg-hot-pink/90 text-white font-josefin font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,0,142,0.4)] hover:shadow-[0_0_30px_rgba(255,0,142,0.6)] hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            NEW CHAT
          </button>
        </div>

        {/* Mode Buttons */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="text-xs text-gray-400 font-josefin font-semibold mb-2 uppercase tracking-wide">
            Coaching Modes
          </div>

          <button
            onClick={() => setMode('BRAIN')}
            className={`w-full px-4 py-3 rounded-xl font-josefin font-bold text-sm transition-all ${
              mode === 'BRAIN'
                ? 'bg-light-teal text-charcoal shadow-[0_0_20px_rgba(0,240,233,0.5)]'
                : 'bg-light-teal/20 text-light-teal hover:bg-light-teal/30 border border-light-teal/30'
            }`}
          >
            BRAIN
          </button>

          <button
            onClick={() => setMode('BODY')}
            className={`w-full px-4 py-3 rounded-xl font-josefin font-bold text-sm transition-all ${
              mode === 'BODY'
                ? 'bg-light-teal text-neon-lime shadow-[0_0_20px_rgba(0,240,233,0.5)]'
                : 'bg-light-teal/20 text-light-teal hover:bg-light-teal/30 border border-light-teal/30'
            }`}
          >
            BODY
          </button>

          <button
            onClick={() => setMode('BUSINESS')}
            className={`w-full px-4 py-3 rounded-xl font-josefin font-bold text-sm transition-all ${
              mode === 'BUSINESS'
                ? 'bg-light-teal text-charcoal shadow-[0_0_20px_rgba(0,240,233,0.5)]'
                : 'bg-light-teal/20 text-light-teal hover:bg-light-teal/30 border border-light-teal/30'
            }`}
          >
            BUSINESS
          </button>
        </div>

        {/* Chat History */}
        <div className="p-4 border-t border-light-teal/20">
          <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-charcoal/60 backdrop-blur-sm text-gray-300 hover:bg-charcoal/80 font-josefin text-sm transition-all border border-light-teal/10">
            <MessageSquare className="w-4 h-4" />
            <span>Chat History</span>
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-light-teal/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 bg-charcoal/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-light-teal/10 flex-1">
              <User className="w-4 h-4 text-light-teal" />
              <span className="text-xs font-josefin font-semibold text-gray-300 truncate">
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-charcoal/60 backdrop-blur-sm text-gray-400 hover:bg-hot-pink/20 hover:text-hot-pink border border-light-teal/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto backdrop-blur-2xl bg-charcoal/30">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal mb-6 shadow-[0_0_60px_rgba(0,240,233,0.4)] animate-pulse-glow">
                  <span className="text-6xl font-supernova text-white">SN</span>
                </div>
                <h2 className="text-4xl font-arp-display font-bold mb-4 text-white">
                  Ready to Transform?
                </h2>
                <p className="text-gray-200 mb-8 text-lg font-josefin">
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
                      className={`max-w-2xl px-6 py-4 rounded-2xl backdrop-blur-xl font-josefin ${
                        msg.role === 'user'
                          ? 'bg-light-teal/90 text-charcoal font-semibold shadow-[0_0_20px_rgba(0,240,233,0.3)]'
                          : 'bg-charcoal/80 text-white border border-light-teal/20'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      {msg.role === 'assistant' && isStreaming && msg.content === '' && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-hot-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-light-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-neon-lime rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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

        {/* Input Area */}
        <div className="backdrop-blur-2xl bg-charcoal/50 border-t border-light-teal/30">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* "How can I help?" header */}
            <div className="mb-3">
              <h3 className="text-lg font-josefin font-semibold text-light-teal">
                How can I help?
              </h3>
            </div>

            {/* Voice Recorder */}
            {user && (
              <div className="mb-4">
                <VoiceRecorder
                  userId={user.id}
                  conversationId={conversationId}
                  onTranscriptionComplete={handleTranscriptionComplete}
                />
              </div>
            )}

            {/* Input box with glass effect */}
            <div className="flex gap-3">
              <div className="flex-1 backdrop-blur-xl bg-white/5 rounded-2xl border-2 border-light-teal/40 shadow-[0_0_30px_rgba(0,240,233,0.2)] focus-within:border-light-teal focus-within:shadow-[0_0_40px_rgba(0,240,233,0.4)] transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything!"
                  className="w-full bg-transparent text-white px-5 py-4 rounded-2xl resize-none focus:outline-none font-josefin placeholder-gray-400"
                  rows={1}
                  disabled={isStreaming}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={`px-8 py-4 rounded-2xl font-josefin font-bold text-sm transition-all ${
                  !input.trim() || isStreaming
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-br from-hot-pink to-light-teal text-white hover:scale-105 shadow-[0_0_30px_rgba(255,0,142,0.4)] hover:shadow-[0_0_40px_rgba(255,0,142,0.6)]'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-josefin text-center">
              SUPERNova AI • {mode} Mode • Powered by Claude
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
