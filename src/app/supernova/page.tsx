'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: string
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  pillar: string | null
  lastMessageAt: string
  _count: { messages: number }
}

export default function SupernovaPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation)
    }
  }, [currentConversation])

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/supernova/conversations')
      if (!res.ok) throw new Error('Failed to load conversations')

      const data = await res.json()
      setConversations(data.conversations)

      // Auto-select first conversation or create new one
      if (data.conversations.length > 0) {
        setCurrentConversation(data.conversations[0].id)
      } else {
        await createNewConversation()
      }
    } catch (error) {
      toast.error('Failed to load conversations')
      console.error(error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/supernova/conversations/${conversationId}`)
      if (!res.ok) throw new Error('Failed to load messages')

      const data = await res.json()
      setMessages(data.conversation.messages)
    } catch (error) {
      toast.error('Failed to load messages')
      console.error(error)
    }
  }

  const createNewConversation = async () => {
    try {
      const res = await fetch('/api/supernova/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      })

      if (!res.ok) throw new Error('Failed to create conversation')

      const data = await res.json()
      setConversations(prev => [data.conversation, ...prev])
      setCurrentConversation(data.conversation.id)
      setMessages([])
      toast.success('New conversation started!')
    } catch (error) {
      toast.error('Failed to create conversation')
      console.error(error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !currentConversation || streaming) return

    const userMessage = input
    setInput('')
    setStreaming(true)

    // Add user message optimistically
    const tempUserMsg: Message = {
      id: 'temp-user',
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    // Add placeholder for AI response
    const tempAiMsg: Message = {
      id: 'temp-ai',
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempAiMsg])

    try {
      const res = await fetch('/api/supernova/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation,
          message: userMessage,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      // Handle streaming response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let aiResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                aiResponse += parsed.content
                // Update AI message in real-time
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === 'temp-ai'
                      ? { ...msg, content: aiResponse }
                      : msg
                  )
                )
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Reload conversation to get actual stored messages
      await loadMessages(currentConversation)
      await loadConversations() // Refresh list with updated timestamp
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
      // Remove temp messages on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-display font-bold text-daitani-pink mb-2">
            SUPERNova AI
          </h1>
          <button
            onClick={createNewConversation}
            className="w-full bg-daitani-pink text-white py-2 rounded-lg font-bold hover:bg-daitani-pink/90 transition-colors focus-ring"
          >
            + New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                currentConversation === conv.id
                  ? 'bg-daitani-pink/10 border-l-4 border-daitani-pink'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-900 truncate">
                {conv.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {conv._count.messages} messages
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Nav */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-gray-600 hover:text-gray-900 py-2"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 adhd-spacing">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Hey there, entrepreneur!
              </h2>
              <p className="text-gray-600 mb-6">
                I'm SUPERNova, your personal AI coach. I'm here to help you build your confident body, brain, and business.
              </p>
              <p className="text-gray-600">
                What would you like to chat about today?
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-daitani-pink text-white'
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || '...'}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus-ring"
                rows={3}
                disabled={streaming}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming || !currentConversation}
                className="bg-daitani-pink text-white px-6 rounded-lg font-bold hover:bg-daitani-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
              >
                {streaming ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
