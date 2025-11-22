'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RevenueMetric {
  date: string
  revenue: number
  mrr: number
  subscriptions: number
  refunds: number
}

export default function RevenueAnalyticsPage() {
  const [metrics, setMetrics] = useState<RevenueMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchRevenueMetrics()
  }, [period])

  const fetchRevenueMetrics = async () => {
    setLoading(true)
    try {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const res = await fetch(
        `/api/analytics/metrics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      const data = await res.json()

      // Group metrics by date
      const metricsByDate: { [key: string]: RevenueMetric } = {}

      data.forEach((metric: any) => {
        const date = new Date(metric.date).toISOString().split('T')[0]
        if (!metricsByDate[date]) {
          metricsByDate[date] = {
            date,
            revenue: 0,
            mrr: 0,
            subscriptions: 0,
            refunds: 0,
          }
        }

        switch (metric.metricType) {
          case 'revenue':
            metricsByDate[date].revenue = metric.metricValue
            break
          case 'mrr':
            metricsByDate[date].mrr = metric.metricValue
            break
        }
      })

      setMetrics(Object.values(metricsByDate).sort((a, b) => b.date.localeCompare(a.date)))
    } catch (error) {
      console.error('Error fetching revenue metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0)
  const latestMRR = metrics[0]?.mrr || 0
  const avgDailyRevenue = metrics.length > 0 ? totalRevenue / metrics.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Revenue Analytics
            </h1>
            <p className="text-gray-600">Track financial metrics and subscription revenue</p>
          </div>

          <div className="flex gap-2">
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
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              onClick={() => setPeriod('year')}
              size="sm"
            >
              1 Year
            </Button>
          </div>
        </div>

        {/* Key Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold">£{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold">£{latestMRR.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Daily Revenue</p>
                <p className="text-3xl font-bold">£{avgDailyRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paying Customers</p>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Revenue Trend</h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {metrics.slice(0, 15).map((metric, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(metric.date).toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{
                            width: `${totalRevenue > 0 ? (metric.revenue / totalRevenue) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        £{metric.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Subscription Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Subscription Tiers</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <div>
                  <p className="font-semibold">BRAVE (Free)</p>
                  <p className="text-sm text-gray-600">£0/month</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">subscribers</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <div>
                  <p className="font-semibold">BOLD</p>
                  <p className="text-sm text-gray-600">£26/month</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">subscribers</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <div>
                  <p className="font-semibold">BADASS</p>
                  <p className="text-sm text-gray-600">£260/year</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">subscribers</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Revenue Events</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Successful Payments</p>
                  <p className="text-sm text-gray-600">0 this period</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Subscription Renewals</p>
                  <p className="text-sm text-gray-600">0 this period</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Failed Payments</p>
                  <p className="text-sm text-gray-600">0 this period</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Forecast */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Revenue Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ARPU</p>
              <p className="text-2xl font-bold">£0.00</p>
              <p className="text-sm text-gray-500">Average Revenue Per User</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">LTV</p>
              <p className="text-2xl font-bold">£0.00</p>
              <p className="text-sm text-gray-500">Lifetime Value</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Churn</p>
              <p className="text-2xl font-bold">0%</p>
              <p className="text-sm text-gray-500">Monthly Churn Rate</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
