'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, MessageSquare } from 'lucide-react'

type CoachingMode = 'BRAIN' | 'BODY' | 'BUSINESS'

interface QuickChatWidgetProps {
  userId?: string
}

export default function QuickChatWidget({ userId }: QuickChatWidgetProps) {
  const [mode, setMode] = useState<CoachingMode>('BRAIN')
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [userMessage, setUserMessage] = useState('')

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Check if userId is available
    if (!userId) {
      setResponse('Please wait, loading your session...')
      return
    }

    setIsLoading(true)
    setResponse('')
    setUserMessage(input.trim()) // Save the user's message for display

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId,
          mode,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Chat API error:', res.status, errorData)
        throw new Error(errorData.error || 'Failed to get response')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      let fullResponse = ''

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
                fullResponse += data.text
                setResponse(fullResponse)
              }
              // Capture the conversationId when streaming is done
              if (data.done && data.conversationId) {
                setConversationId(data.conversationId)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
        setResponse('Database connection issue. Please check your setup.')
      } else if (errorMessage.includes('API key') || errorMessage.includes('anthropic')) {
        setResponse('AI service unavailable. Check API configuration.')
      } else {
        setResponse(`Error: ${errorMessage}. Try the full chat!`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF008E] to-[#00F0E9] flex items-center justify-center">
          <MessageSquare size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">SUPERNOVA</h3>
          <p className="text-[#888888] text-xs">Quick Chat</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        {(['BRAIN', 'BODY', 'BUSINESS'] as CoachingMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              mode === m
                ? 'bg-gradient-to-r from-[#FF008E] to-[#C9005C] text-white'
                : 'border border-[#3d3d3d] text-[#888888] hover:border-[#00F0E9] hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Response Area */}
      {response && (
        <div className="mb-4 p-3 bg-[#0a0a0a] rounded-lg max-h-[200px] overflow-y-auto">
          <p className="text-white text-sm whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {/* Prompt */}
      {!response && (
        <p className="text-[#888888] text-sm mb-4">How can I help you today?</p>
      )}

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={userId ? "Ask anything..." : "Loading..."}
          disabled={isLoading || !userId}
          className="flex-1 bg-[#0a0a0a] border border-[#3d3d3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#00F0E9] transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || !userId}
          className={`p-2.5 rounded-lg transition-all ${
            !input.trim() || isLoading || !userId
              ? 'bg-[#3d3d3d] text-[#666666]'
              : 'bg-gradient-to-r from-[#FF008E] to-[#C9005C] text-white hover:opacity-90'
          }`}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Footer */}
      <Link
        href={conversationId ? `/dashboard?conversation=${conversationId}` : '/dashboard'}
        className="text-[#00F0E9] text-sm hover:underline"
      >
        Open Full Chat →
      </Link>
    </div>
  )
}
