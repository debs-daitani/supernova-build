'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Upload,
  X,
  Clock,
  User,
  CheckCircle,
  RotateCcw,
  Download,
} from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED'
type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface Message {
  id: string
  message: string
  isInternal: boolean
  createdAt: string
  user: {
    profile: {
      firstName: string
      lastName: string
    } | null
    role: string
  }
  attachments: Array<{
    id: string
    filename: string
    url: string
  }>
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  createdAt: string
  messages: Message[]
}

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  WAITING_USER: { label: 'Waiting for You', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800 border-green-200' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      } else if (response.status === 404) {
        router.push('/support')
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles([...files, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/support/tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      })

      if (response.ok) {
        const newMessage = await response.json()

        // Upload files if any
        if (files.length > 0) {
          const formData = new FormData()
          files.forEach((file) => formData.append('files', file))

          await fetch(`/api/support/tickets/${params.id}/attachments?messageId=${newMessage.id}`, {
            method: 'POST',
            body: formData,
          })
        }

        setReplyText('')
        setFiles([])
        await fetchTicket()
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      const response = await fetch(`/api/support/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchTicket()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </Link>

          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
                <p className="text-sm text-gray-600">
                  Created {formatDate(ticket.createdAt)} • {ticket.category.replace('_', ' ')}
                </p>
              </div>

              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[ticket.status].color}`}>
                  {STATUS_CONFIG[ticket.status].label}
                </span>
                <span className={`px-3 py-1 rounded text-xs font-medium ${PRIORITY_CONFIG[ticket.priority].color}`}>
                  {PRIORITY_CONFIG[ticket.priority].label}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {ticket.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Resolved
                </button>
              )}
              {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                <button
                  onClick={() => handleStatusChange('OPEN')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 mb-6">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversation
            </h2>
          </div>

          <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
            {/* Initial Ticket */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">You</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {ticket.messages.map((msg) => {
              if (msg.isInternal) return null // Don't show internal notes to users

              const isUser = msg.user.role !== 'ADMIN'
              const userName = msg.user.profile
                ? `${msg.user.profile.firstName} ${msg.user.profile.lastName}`
                : isUser
                ? 'You'
                : 'Support Team'

              return (
                <div key={msg.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 ${isUser ? 'bg-purple-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                      <User className={`w-5 h-5 ${isUser ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className={`${isUser ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{userName}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.url}
                              download
                              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              {att.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Reply Form */}
        {ticket.status !== 'CLOSED' && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Send a Reply</h3>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 mb-4"
            />

            {/* File Upload */}
            <div className="mb-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="reply-files"
              />
              <label
                htmlFor="reply-files"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                Attach Files
              </label>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2"
                    >
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
