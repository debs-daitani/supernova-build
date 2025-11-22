'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Ticket, Plus, MessageSquare, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED'
type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface SupportTicket {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  createdAt: string
  lastActivityAt: string
  _count: {
    messages: number
  }
}

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: MessageSquare },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  WAITING_USER: { label: 'Waiting', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | TicketStatus>('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true
    return ticket.status === filter
  })

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Support Tickets</h1>
                <p className="text-gray-600">View and manage your support requests</p>
              </div>
            </div>

            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Ticket
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setFilter('OPEN')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'OPEN'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'IN_PROGRESS'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'RESOLVED'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilter('CLOSED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'CLOSED'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tickets...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTickets.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't created any support tickets yet."
                : `No ${filter === 'all' ? '' : STATUS_CONFIG[filter as TicketStatus]?.label.toLowerCase()} tickets.`}
            </p>
            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Ticket
            </Link>
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && filteredTickets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              const StatusIcon = STATUS_CONFIG[ticket.status].icon
              return (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all"
                >
                  {/* Status & Priority */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        STATUS_CONFIG[ticket.status].color
                      }`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {STATUS_CONFIG[ticket.status].label}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        PRIORITY_CONFIG[ticket.priority].color
                      }`}
                    >
                      {PRIORITY_CONFIG[ticket.priority].label}
                    </span>
                  </div>

                  {/* Subject */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {ticket.subject}
                  </h3>

                  {/* Category */}
                  <p className="text-sm text-gray-500 mb-4">{ticket.category.replace('_', ' ')}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {ticket._count.messages} {ticket._count.messages === 1 ? 'message' : 'messages'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getTimeAgo(ticket.lastActivityAt)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
