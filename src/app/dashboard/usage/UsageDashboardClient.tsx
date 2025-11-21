'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  MessageSquare,
  Mail,
  Share2,
  Video,
  Image,
  Film,
  HardDrive,
  GraduationCap,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  Crown,
  Zap,
} from 'lucide-react'

interface UsageData {
  month: string
  usage: {
    [key: string]: {
      current: number
      limit: number
      percentage: number
    }
  }
  userRole: string
}

export function UsageDashboardClient({ userId }: { userId: string }) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage/stats')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!data) {
    return <div>Error loading usage data</div>
  }

  const getColorClass = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const getTextColorClass = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-amber-600'
    return 'text-green-600'
  }

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    if (limit === 0) return 'Not Available'
    if (limit >= 1000000000) return `${(limit / 1000000000).toFixed(1)}GB`
    if (limit >= 1000000) return `${(limit / 1000000).toFixed(1)}M`
    return limit.toString()
  }

  const formatCurrent = (current: number, feature: string) => {
    if (feature === 'storageUsedBytes') {
      if (current >= 1000000000) return `${(current / 1000000000).toFixed(2)}GB`
      if (current >= 1000000) return `${(current / 1000000).toFixed(2)}MB`
      return `${(current / 1000).toFixed(2)}KB`
    }
    return current.toString()
  }

  const features = [
    {
      key: 'supernovaMessages',
      name: 'SUPERNova AI Messages',
      icon: MessageSquare,
      description: 'Monthly AI conversation messages',
    },
    {
      key: 'emailSubscribers',
      name: 'Email Subscribers',
      icon: Mail,
      description: 'Maximum email list subscribers',
    },
    {
      key: 'socialPostsScheduled',
      name: 'Social Media Posts',
      icon: Share2,
      description: 'Monthly scheduled social posts',
    },
    {
      key: 'contentVideosRepurposed',
      name: 'Content Repurposing',
      icon: Video,
      description: 'Monthly videos repurposed',
    },
    {
      key: 'aiImagesGenerated',
      name: 'AI Image Generation',
      icon: Image,
      description: 'Monthly AI-generated images',
    },
    {
      key: 'aiVideosGenerated',
      name: 'AI Video Generation',
      icon: Film,
      description: 'Monthly AI-generated videos',
    },
    {
      key: 'storageUsedBytes',
      name: 'Storage Used',
      icon: HardDrive,
      description: 'Total file storage',
    },
    {
      key: 'coursesHosted',
      name: 'Courses Hosted',
      icon: GraduationCap,
      description: 'Maximum hosted courses',
    },
    {
      key: 'productsListed',
      name: 'Products Listed',
      icon: ShoppingCart,
      description: 'Maximum store products',
    },
  ]

  const getRoleBadge = () => {
    switch (data.userRole) {
      case 'FREE':
        return { icon: '🎯', color: 'bg-gray-100 text-gray-700', name: 'Free' }
      case 'UPGRADE':
        return { icon: '⭐', color: 'bg-purple-100 text-purple-700', name: 'Upgrade' }
      case 'MEMBER':
        return { icon: '👑', color: 'bg-pink-100 text-pink-700', name: 'Member' }
      case 'ADMIN':
        return { icon: '⚡', color: 'bg-blue-100 text-blue-700', name: 'Admin' }
      default:
        return { icon: '🎯', color: 'bg-gray-100 text-gray-700', name: 'Free' }
    }
  }

  const badge = getRoleBadge()

  // Check if user is approaching limits
  const approachingLimits = features.filter(
    (f) => data.usage[f.key]?.percentage >= 80 && data.usage[f.key]?.percentage < 100
  )
  const atLimits = features.filter((f) => data.usage[f.key]?.percentage >= 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Usage Dashboard</h1>
              <p className="text-gray-600">Track your monthly usage and limits</p>
            </div>
          </div>

          {/* Current Tier */}
          <div className="flex items-center gap-4 mt-6">
            <span className={`text-sm font-semibold px-4 py-2 rounded-full ${badge.color}`}>
              {badge.icon} {badge.name} Plan
            </span>
            <span className="text-sm text-gray-600">Usage for {data.month}</span>
          </div>
        </div>

        {/* Alerts */}
        {atLimits.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">You've reached your limits!</h3>
                <p className="text-red-700 mb-3">
                  You've hit the monthly limit for: {atLimits.map((f) => f.name).join(', ')}
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Upgrade Your Plan
                </Link>
              </div>
            </div>
          </div>
        )}

        {approachingLimits.length > 0 && atLimits.length === 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-2">Approaching your limits</h3>
                <p className="text-amber-700 mb-3">
                  You've used over 80% of your quota for: {approachingLimits.map((f) => f.name).join(', ')}
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                >
                  Upgrade for More
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Usage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const usage = data.usage[feature.key]
            if (!usage) return null

            const Icon = feature.icon
            const percentage = usage.percentage
            const colorClass = getColorClass(percentage)
            const textColorClass = getTextColorClass(percentage)

            return (
              <div
                key={feature.key}
                className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current</span>
                    <span className={`font-bold ${textColorClass}`}>
                      {formatCurrent(usage.current, feature.key)} / {formatLimit(usage.limit)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${colorClass}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{percentage}% used</span>
                    {usage.limit > 0 && usage.limit !== -1 && (
                      <span className="text-gray-500">{usage.limit - usage.current} remaining</span>
                    )}
                  </div>
                </div>

                {percentage >= 100 && (
                  <div className="mt-3 text-xs text-red-600 font-medium">Limit reached!</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Upgrade CTA */}
        {data.userRole !== 'ADMIN' && data.userRole !== 'MEMBER' && (
          <div className="mt-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-8 text-center text-white shadow-xl">
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Need More?</h2>
            <p className="text-lg mb-4">
              Upgrade to {data.userRole === 'FREE' ? 'Upgrade' : 'Member'} for higher limits and more features
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
