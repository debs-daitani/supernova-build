'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatMetricValue, getDateRange } from '@/lib/analytics-tracking'

interface MetricCard {
  title: string
  value: string
  change: number
  icon: any
  color: string
}

export default function AnalyticsOverviewPage() {
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    fetchMetrics()
  }, [period])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const { start, end } = getDateRange(period)
      const res = await fetch(
        `/api/analytics/metrics?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      )
      const data = await res.json()

      // Process metrics into cards
      const metricCards: MetricCard[] = [
        {
          title: 'Daily Active Users',
          value: getMetricValue(data, 'dau'),
          change: calculateChange(data, 'dau'),
          icon: Users,
          color: 'from-blue-500 to-cyan-500',
        },
        {
          title: 'Monthly Active Users',
          value: getMetricValue(data, 'mau'),
          change: calculateChange(data, 'mau'),
          icon: TrendingUp,
          color: 'from-purple-500 to-pink-500',
        },
        {
          title: 'Daily Revenue',
          value: getMetricValue(data, 'revenue'),
          change: calculateChange(data, 'revenue'),
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
        },
        {
          title: 'Page Views',
          value: getMetricValue(data, 'page_views'),
          change: calculateChange(data, 'page_views'),
          icon: MousePointerClick,
          color: 'from-orange-500 to-red-500',
        },
        {
          title: 'Avg Session',
          value: getMetricValue(data, 'avg_session_duration'),
          change: calculateChange(data, 'avg_session_duration'),
          icon: Clock,
          color: 'from-pink-500 to-purple-500',
        },
        {
          title: 'Conversion Rate',
          value: getMetricValue(data, 'conversion_rate'),
          change: calculateChange(data, 'conversion_rate'),
          icon: Activity,
          color: 'from-indigo-500 to-purple-500',
        },
      ]

      setMetrics(metricCards)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricValue = (data: any[], metricType: string): string => {
    const latest = data.find((m) => m.metricType === metricType)
    if (!latest) return '0'

    switch (metricType) {
      case 'revenue':
        return `£${latest.metricValue.toFixed(2)}`
      case 'conversion_rate':
        return `${(latest.metricValue * 100).toFixed(1)}%`
      case 'avg_session_duration':
        const mins = Math.floor(latest.metricValue / 60)
        const secs = Math.floor(latest.metricValue % 60)
        return `${mins}m ${secs}s`
      default:
        return latest.metricValue.toLocaleString()
    }
  }

  const calculateChange = (data: any[], metricType: string): number => {
    const sorted = data
      .filter((m) => m.metricType === metricType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sorted.length < 2) return 0

    const current = sorted[0].metricValue
    const previous = sorted[1].metricValue

    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Analytics Overview
            </h1>
            <p className="text-gray-600">Track your platform metrics and insights</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={period === 'day' ? 'default' : 'outline'}
              onClick={() => setPeriod('day')}
              size="sm"
            >
              Today
            </Button>
            <Button
              variant={period === 'week' ? 'default' : 'outline'}
              onClick={() => setPeriod('week')}
              size="sm"
            >
              7 Days
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              onClick={() => setPeriod('month')}
              size="sm"
            >
              30 Days
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/analytics/users">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <Users className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold">Users</h3>
              <p className="text-sm text-gray-600">User behavior</p>
            </Card>
          </Link>
          <Link href="/analytics/features">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <BarChart3 className="w-8 h-8 text-pink-500 mb-2" />
              <h3 className="font-semibold">Features</h3>
              <p className="text-sm text-gray-600">Feature usage</p>
            </Card>
          </Link>
          <Link href="/analytics/revenue">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <DollarSign className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold">Revenue</h3>
              <p className="text-sm text-gray-600">Financial metrics</p>
            </Card>
          </Link>
          <Link href="/analytics/traffic">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold">Traffic</h3>
              <p className="text-sm text-gray-600">Traffic sources</p>
            </Card>
          </Link>
        </div>

        {/* Key Metrics */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading metrics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              const isPositive = metric.change >= 0
              const ChangeIcon = isPositive ? ArrowUp : ArrowDown

              return (
                <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${metric.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <ChangeIcon className="w-4 h-4" />
                      <span>{Math.abs(metric.change).toFixed(1)}%</span>
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm mb-1">{metric.title}</h3>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </Card>
              )
            })}
          </div>
        )}

        {/* Additional Analytics Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/analytics/content">
            <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Content Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Track performance of websites, designs, images, and videos
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/analytics/realtime">
            <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Live user activity and current sessions
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/analytics/reports">
            <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <LineChart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Custom Reports</h3>
                  <p className="text-sm text-gray-600">
                    Generate and export custom analytics reports
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
            <h3 className="font-semibold mb-3">Privacy & Compliance</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• GDPR compliant analytics tracking</li>
              <li>• IP address anonymization enabled</li>
              <li>• User data export & deletion available</li>
              <li>• Cookie consent management</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
