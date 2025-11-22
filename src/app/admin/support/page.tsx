'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Ticket, Search, Filter, AlertCircle, Clock, CheckCircle } from 'lucide-react'

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
  user: {
    email: string
    role: string
    profile: {
      firstName: string
      lastName: string
    } | null
  }
  assignedAdmin: {
    profile: {
      firstName: string
      lastName: string
    } | null
  } | null
}

interface Stats {
  total: number
  open: number
  urgent: number
  overdue: number
}

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  WAITING_USER: { label: 'Waiting', color: 'bg-orange-100 text-orange-800' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

const TIER_CONFIG = {
  FREE: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  UPGRADE: { label: 'BRAVE', color: 'bg-purple-100 text-purple-700' },
  MEMBER: { label: 'BOLD', color: 'bg-pink-100 text-pink-700' },
  ADMIN: { label: 'BADASS', color: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' },
}

export default function AdminSupportInboxPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, urgent: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/support/tickets')
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/support/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = searchTerm === '' ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === '' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === '' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === '' || ticket.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUserName = (ticket: SupportTicket) => {
    if (ticket.user.profile) {
      return `${ticket.user.profile.firstName} ${ticket.user.profile.lastName}`
    }
    return ticket.user.email
  }

  const getAssignedAdmin = (ticket: SupportTicket) => {
    if (ticket.assignedAdmin?.profile) {
      return `${ticket.assignedAdmin.profile.firstName} ${ticket.assignedAdmin.profile.lastName}`
    }
    return 'Unassigned'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Support Inbox</h1>
                <p className="text-gray-600">Manage all support tickets</p>
              </div>
            </div>

            <Link
              href="/admin/support/analytics"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              View Analytics
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.open}</div>
            <div className="text-sm text-gray-600">Open Tickets</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-red-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.urgent}</div>
            <div className="text-sm text-gray-600">Urgent Priority</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue SLA</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ticket ID, subject, or user email..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_USER">Waiting</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Loading tickets...
                    </td>
                  </tr>
                )}

                {!loading && filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => window.location.href = `/admin/support/${ticket.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {ticket.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getUserName(ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_CONFIG[ticket.status].color}`}>
                          {STATUS_CONFIG[ticket.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_CONFIG[ticket.priority].color}`}>
                          {PRIORITY_CONFIG[ticket.priority].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${TIER_CONFIG[ticket.user.role as keyof typeof TIER_CONFIG]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {TIER_CONFIG[ticket.user.role as keyof typeof TIER_CONFIG]?.label || ticket.user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getAssignedAdmin(ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ticket.lastActivityAt)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
