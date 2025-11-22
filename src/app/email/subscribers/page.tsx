'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Plus, Search, Download, Upload, Users, Tag } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  tags: string[]
  subscribedAt: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [quota, setQuota] = useState({ current: 0, limit: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchSubscribers()
  }, [statusFilter])

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/email/subscribers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers)
        setQuota(data.quota)
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      searchTerm === '' ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const handleExport = () => {
    const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Tags', 'Subscribed At']
    const rows = filteredSubscribers.map((sub) => [
      sub.email,
      sub.firstName || '',
      sub.lastName || '',
      sub.status,
      sub.tags.join('; '),
      new Date(sub.subscribedAt).toLocaleDateString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const quotaPercentage = quota.limit > 0 ? (quota.current / quota.limit) * 100 : 0
  const isNearLimit = quotaPercentage > 80

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Email Subscribers</h1>
                <p className="text-gray-600">Manage your email subscriber list</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={filteredSubscribers.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>

              <Link
                href="/email/subscribers/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Subscribers
              </Link>
            </div>
          </div>
        </div>

        {/* Quota Display */}
        <div className={`rounded-xl shadow-md border-2 p-6 mb-8 ${isNearLimit ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Subscriber Quota</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {quota.current} / {quota.limit === Infinity ? '∞' : quota.limit}
            </span>
          </div>

          {quota.limit !== Infinity && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${isNearLimit ? 'bg-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-600'}`}
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              ></div>
            </div>
          )}

          {isNearLimit && quota.limit !== Infinity && (
            <p className="text-sm text-orange-700 mt-2">
              You're approaching your subscriber limit. Consider upgrading your plan to add more subscribers.
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="SUBSCRIBED">Subscribed</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
                <option value="BOUNCED">Bounced</option>
                <option value="COMPLAINED">Complained</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading subscribers...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSubscribers.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No subscribers yet</h3>
            <p className="text-gray-600 mb-6">
              {subscribers.length === 0
                ? "Get started by adding your first subscriber or importing a list."
                : "No subscribers match your search criteria."}
            </p>
            {subscribers.length === 0 && (
              <Link
                href="/email/subscribers/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Subscriber
              </Link>
            )}
          </div>
        )}

        {/* Subscribers Table */}
        {!loading && filteredSubscribers.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscribed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscriber.firstName || subscriber.lastName
                          ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            subscriber.status === 'SUBSCRIBED'
                              ? 'bg-green-100 text-green-800'
                              : subscriber.status === 'UNSUBSCRIBED'
                              ? 'bg-gray-100 text-gray-800'
                              : subscriber.status === 'BOUNCED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {subscriber.tags.length > 0 ? (
                            subscriber.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
