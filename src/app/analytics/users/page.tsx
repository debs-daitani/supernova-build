'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, UserMinus, Clock, MousePointerClick } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface UserMetric {
  date: string
  dau: number
  wau: number
  mau: number
  new_users: number
  retention_rate: number
  churn_rate: number
}

export default function UsersAnalyticsPage() {
  const [metrics, setMetrics] = useState<UserMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchUserMetrics()
  }, [period])

  const fetchUserMetrics = async () => {
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
      const metricsByDate: { [key: string]: UserMetric } = {}

      data.forEach((metric: any) => {
        const date = new Date(metric.date).toISOString().split('T')[0]
        if (!metricsByDate[date]) {
          metricsByDate[date] = {
            date,
            dau: 0,
            wau: 0,
            mau: 0,
            new_users: 0,
            retention_rate: 0,
            churn_rate: 0,
          }
        }

        switch (metric.metricType) {
          case 'dau':
            metricsByDate[date].dau = metric.metricValue
            break
          case 'wau':
            metricsByDate[date].wau = metric.metricValue
            break
          case 'mau':
            metricsByDate[date].mau = metric.metricValue
            break
          case 'new_users':
            metricsByDate[date].new_users = metric.metricValue
            break
          case 'retention_rate':
            metricsByDate[date].retention_rate = metric.metricValue
            break
          case 'churn_rate':
            metricsByDate[date].churn_rate = metric.metricValue
            break
        }
      })

      setMetrics(Object.values(metricsByDate).sort((a, b) => b.date.localeCompare(a.date)))
    } catch (error) {
      console.error('Error fetching user metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const latestMetric = metrics[0] || {
    dau: 0,
    wau: 0,
    mau: 0,
    new_users: 0,
    retention_rate: 0,
    churn_rate: 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              User Analytics
            </h1>
            <p className="text-gray-600">Track user growth, engagement, and retention</p>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Daily Active Users</p>
                <p className="text-3xl font-bold">{latestMetric.dau.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Active Users</p>
                <p className="text-3xl font-bold">{latestMetric.wau.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Active Users</p>
                <p className="text-3xl font-bold">{latestMetric.mau.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">New Users</p>
                <p className="text-3xl font-bold">{latestMetric.new_users.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Retention Rate</p>
                <p className="text-3xl font-bold">
                  {(latestMetric.retention_rate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <UserMinus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-3xl font-bold">
                  {(latestMetric.churn_rate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* User Growth Chart */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">User Growth Trend</h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {metrics.slice(0, 10).map((metric, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(metric.date).toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                          style={{ width: `${(metric.dau / latestMetric.dau) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {metric.dau}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* User Cohorts */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">User Segmentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">BRAVE Tier</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Free users</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">BOLD Tier</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">£26/month</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">BADASS Tier</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">£260/year</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
