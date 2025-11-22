'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Ticket, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react'

interface Analytics {
  totalTickets: number
  openTickets: number
  resolvedThisWeek: number
  averageResponseTime: number
  ticketsByStatus: {
    status: string
    count: number
  }[]
  ticketsByCategory: {
    category: string
    count: number
  }[]
  responseTimeByTier: {
    tier: string
    avgResponseTime: number
    slaTarget: number
  }[]
  adminWorkload: {
    adminName: string
    openTickets: number
    resolvedTickets: number
  }[]
  ticketsOverTime: {
    date: string
    count: number
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  WAITING_USER: 'bg-orange-500',
  RESOLVED: 'bg-green-500',
  CLOSED: 'bg-gray-500',
}

export default function AdminSupportAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/support/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inbox
          </Link>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Support Analytics</h1>
              <p className="text-gray-600">Performance metrics and insights</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalTickets}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.openTickets}</div>
            <div className="text-sm text-gray-600">Open Tickets</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.resolvedThisWeek}</div>
            <div className="text-sm text-gray-600">Resolved This Week</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatMinutes(analytics.averageResponseTime)}
            </div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tickets by Status */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tickets by Status</h2>

            <div className="space-y-4">
              {analytics.ticketsByStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.status.replace('_', ' ')}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-500'}`}
                      style={{
                        width: `${Math.max(10, (item.count / analytics.totalTickets) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets by Category */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>

            <div className="space-y-4">
              {analytics.ticketsByCategory.slice(0, 5).map((item, index) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.category.replace('_', ' ')}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{
                        width: `${Math.max(10, (item.count / analytics.totalTickets) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Time by Tier */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Response Time by Tier (vs SLA Target)</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.responseTimeByTier.map((tier) => {
                  const avgHours = tier.avgResponseTime / 60
                  const slaHours = tier.slaTarget / 60
                  const performance = ((slaHours - avgHours) / slaHours) * 100
                  const isGood = avgHours <= slaHours

                  return (
                    <tr key={tier.tier}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tier.tier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMinutes(tier.avgResponseTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(slaHours)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isGood
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isGood ? '✓ Within SLA' : '✗ Exceeds SLA'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Workload */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Admin Workload
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolved Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.adminWorkload.map((admin) => (
                  <tr key={admin.adminName}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.adminName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.openTickets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.resolvedTickets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {admin.openTickets + admin.resolvedTickets}
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
