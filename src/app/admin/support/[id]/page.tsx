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
  Mail,
  Calendar,
  Ticket as TicketIcon,
  Download,
  Eye,
  EyeOff,
  Settings,
  CheckCircle,
  XCircle,
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
  user: {
    id: string
    email: string
    role: string
    createdAt: string
    profile: {
      firstName: string
      lastName: string
    } | null
    _count: {
      supportTickets: number
    }
  }
}

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_USER', label: 'Waiting for User' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

const CANNED_RESPONSES = [
  {
    title: 'Thank you for contacting',
    content: 'Thank you for contacting us. We\'ve received your ticket and a member of our team will respond shortly.',
  },
  {
    title: 'Issue resolved',
    content: 'We\'re pleased to confirm that this issue has been resolved. If you continue to experience problems, please don\'t hesitate to reopen this ticket.',
  },
  {
    title: 'Need more information',
    content: 'To help us resolve your issue, could you please provide:\n\n1. More details about when this started\n2. Any error messages you\'re seeing\n3. Screenshots if applicable\n\nThank you!',
  },
  {
    title: 'Under investigation',
    content: 'We\'re currently investigating this issue. Our team is working on it and we\'ll update you as soon as we have more information.',
  },
]

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [sending, setSending] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [showCannedResponses, setShowCannedResponses] = useState(false)

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 10000)
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
      const response = await fetch(`/api/admin/support/tickets/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      } else if (response.status === 404) {
        router.push('/admin/support')
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
      const response = await fetch(`/api/admin/support/tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyText,
          isInternal: isInternalNote,
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()

        if (files.length > 0) {
          const formData = new FormData()
          files.forEach((file) => formData.append('files', file))

          await fetch(`/api/admin/support/tickets/${params.id}/attachments?messageId=${newMessage.id}`, {
            method: 'POST',
            body: formData,
          })
        }

        setReplyText('')
        setFiles([])
        setIsInternalNote(false)
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
      const response = await fetch(`/api/admin/support/tickets/${params.id}`, {
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

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (response.ok) {
        await fetchTicket()
      }
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const insertCannedResponse = (content: string) => {
    setReplyText((prev) => (prev ? prev + '\n\n' + content : content))
    setShowCannedResponses(false)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inbox
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Ticket Header */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{ticket.subject}</h1>

              <div className="flex flex-wrap gap-3 mb-4">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Created {formatDate(ticket.createdAt)}
                </span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">{ticket.category.replace('_', ' ')}</span>
              </div>

              {/* Admin Controls */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-purple-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-purple-500"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
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
                        <span className="font-medium text-gray-900">
                          {ticket.user.profile
                            ? `${ticket.user.profile.firstName} ${ticket.user.profile.lastName}`
                            : ticket.user.email}
                        </span>
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
                  const isAdmin = msg.user.role === 'ADMIN'
                  const userName = msg.user.profile
                    ? `${msg.user.profile.firstName} ${msg.user.profile.lastName}`
                    : isAdmin
                    ? 'Admin'
                    : ticket.user.email

                  return (
                    <div key={msg.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 ${
                            isAdmin ? 'bg-blue-100' : 'bg-purple-100'
                          } rounded-full flex items-center justify-center`}
                        >
                          <User
                            className={`w-5 h-5 ${isAdmin ? 'text-blue-600' : 'text-purple-600'}`}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`${
                            msg.isInternal
                              ? 'bg-yellow-50 border-2 border-yellow-300'
                              : isAdmin
                              ? 'bg-blue-50'
                              : 'bg-gray-50'
                          } rounded-lg p-4`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{userName}</span>
                              {msg.isInternal && (
                                <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                                  Internal Note
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.url}
                                  download
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
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
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Send Reply</h3>
                <button
                  onClick={() => setShowCannedResponses(!showCannedResponses)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showCannedResponses ? 'Hide' : 'Show'} Canned Responses
                </button>
              </div>

              {showCannedResponses && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {CANNED_RESPONSES.map((response, index) => (
                    <button
                      key={index}
                      onClick={() => insertCannedResponse(response.content)}
                      className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors text-left"
                    >
                      {response.title}
                    </button>
                  ))}
                </div>
              )}

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

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>

                <button
                  onClick={() => setIsInternalNote(!isInternalNote)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isInternalNote
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  {isInternalNote ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isInternalNote ? 'Internal Note' : 'Visible to User'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Info */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Name</div>
                  <div className="font-medium text-gray-900">
                    {ticket.user.profile
                      ? `${ticket.user.profile.firstName} ${ticket.user.profile.lastName}`
                      : 'Not set'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {ticket.user.email}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Tier</div>
                  <div className="font-medium text-gray-900">{ticket.user.role}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Member Since</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(ticket.user.createdAt).toLocaleDateString('en-GB')}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Tickets</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <TicketIcon className="w-4 h-4 text-gray-400" />
                    {ticket.user._count.supportTickets}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Resolved
                </button>

                <button
                  onClick={() => handleStatusChange('CLOSED')}
                  className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Close Ticket
                </button>

                <button
                  onClick={() => handlePriorityChange('URGENT')}
                  className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
                >
                  Escalate to Urgent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
