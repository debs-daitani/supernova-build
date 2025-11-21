'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Users,
  TrendingUp,
  Database,
  Crown,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface AdminUsageStats {
  month: string
  totals: {
    totalUsers: number
    supernovaMessages: number
    emailSubscribers: number
    socialPostsScheduled: number
    contentVideosRepurposed: number
    aiImagesGenerated: number
    aiVideosGenerated: number
    storageUsedBytes: number
  }
  byTier: {
    FREE: number
    UPGRADE: number
    MEMBER: number
    ADMIN: number
  }
  topUsers: Array<{
    email: string
    role: string
    supernovaMessages: number
  }>
}

export function AdminUsageClient() {
  const [data, setData] = useState<AdminUsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/usage')

      if (response.status === 403) {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch usage statistics')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching admin usage:', err)
      setError('Error loading usage statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="block w-full bg-purple-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>No data available</div>
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(2)} GB`
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(2)} MB`
    return `${(bytes / 1000).toFixed(2)} KB`
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-gray-100 text-gray-700'
      case 'UPGRADE':
        return 'bg-purple-100 text-purple-700'
      case 'MEMBER':
        return 'bg-pink-100 text-pink-700'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const totalActiveUsers = Object.values(data.byTier).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 group transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Analytics</h1>
              <p className="text-gray-600">Platform-wide usage statistics</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <span className="text-sm font-semibold px-4 py-2 rounded-full bg-blue-100 text-blue-700">
              ⚡ Admin Dashboard
            </span>
            <span className="text-sm text-gray-600">Analytics for {data.month}</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(totalActiveUsers)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">SUPERNova Messages</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(data.totals.supernovaMessages)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-pink-600" />
              <div>
                <p className="text-sm text-gray-600">Social Posts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(data.totals.socialPostsScheduled)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Storage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatBytes(data.totals.storageUsedBytes)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Platform Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Tier */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              Users by Tier
            </h2>
            <div className="space-y-3">
              {Object.entries(data.byTier).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getTierColor(tier)}`}>
                    {tier}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{formatNumber(count)}</span>
                </div>
              ))}
              <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-between">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-xl font-bold text-purple-600">{formatNumber(totalActiveUsers)}</span>
              </div>
            </div>
          </div>

          {/* Platform Totals */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600" />
              Platform Totals
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Email Subscribers</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(data.totals.emailSubscribers)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Videos Repurposed</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(data.totals.contentVideosRepurposed)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">AI Images Generated</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(data.totals.aiImagesGenerated)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">AI Videos Generated</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(data.totals.aiVideosGenerated)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-pink-600" />
            Top 10 Users by SUPERNova Messages
          </h2>
          {data.topUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No usage data available yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tier</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUsers.map((user, index) => (
                    <tr key={user.email} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTierColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatNumber(user.supernovaMessages)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
