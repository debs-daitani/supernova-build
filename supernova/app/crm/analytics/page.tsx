'use client'

import { useState, useEffect } from 'react'
import { Users, PoundSterling, TrendingUp, CheckSquare, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/crm/analytics')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-supernova text-light-teal">CRM Analytics</h2>
        <p className="text-sm text-gray-400 font-josefin">Key metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Contacts"
          value={analytics.contacts.total}
          icon={Users}
          color="light-teal"
          subtitle={`${analytics.contacts.recent} added in last 30 days`}
        />
        <MetricCard
          title="Total Deals"
          value={analytics.deals.total}
          icon={PoundSterling}
          color="hot-pink"
          subtitle={`${analytics.deals.recent} created in last 30 days`}
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${analytics.deals.pipelineValue.toLocaleString()}`}
          icon={TrendingUp}
          color="neon-lime"
          subtitle="Open opportunities"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analytics.deals.conversionRate}%`}
          icon={TrendingUp}
          color="purple-400"
          subtitle="Won vs Lost deals"
        />
      </div>

      {/* Contacts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-xl font-supernova text-light-teal mb-4">Contacts by Status</h3>
          <div className="space-y-3">
            {analytics.contacts.byStatus.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="font-josefin text-gray-300">{item.status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-light-teal"
                      style={{
                        width: `${(item._count.id / analytics.contacts.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-josefin text-white font-semibold w-12 text-right">
                    {item._count.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-xl font-supernova text-light-teal mb-4">Contacts by Source</h3>
          <div className="space-y-3">
            {analytics.contacts.bySource.map((item: any) => (
              <div key={item.source} className="flex items-center justify-between">
                <span className="font-josefin text-gray-300">{item.source}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hot-pink"
                      style={{
                        width: `${(item._count.id / analytics.contacts.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-josefin text-white font-semibold w-12 text-right">
                    {item._count.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Breakdown */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
        <h3 className="text-xl font-supernova text-light-teal mb-4">Deal Pipeline by Stage</h3>
        <div className="space-y-4">
          {analytics.deals.byStage.map((item: any) => (
            <div key={item.stage}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-josefin text-gray-300">{item.stage}</span>
                <div className="flex items-center gap-4">
                  <span className="font-josefin text-hot-pink font-semibold">
                    ${(item._sum.value || 0).toLocaleString()}
                  </span>
                  <span className="font-josefin text-white font-semibold">
                    {item._count.id} deals
                  </span>
                </div>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-hot-pink to-light-teal"
                  style={{
                    width: `${
                      analytics.deals.pipelineValue > 0
                        ? ((item._sum.value || 0) / analytics.deals.pipelineValue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Won This Month */}
        <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-josefin text-gray-300">Won This Month</div>
              <div className="text-2xl font-supernova text-green-400">
                ${analytics.deals.wonThisMonth.value.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-josefin text-gray-300">Deals Closed</div>
              <div className="text-2xl font-supernova text-green-400">
                {analytics.deals.wonThisMonth.count}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-xl font-supernova text-light-teal mb-4">Tasks Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-josefin text-gray-300">Total Tasks</span>
              <span className="font-josefin text-white font-semibold">{analytics.tasks.total}</span>
            </div>
            {analytics.tasks.byStatus.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="font-josefin text-gray-300">{item.status.replace('_', ' ')}</span>
                <span className="font-josefin text-white">{item._count.id}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="font-josefin text-red-400">Overdue</span>
              <span className="font-josefin text-red-400 font-semibold">
                {analytics.tasks.overdue}
              </span>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-xl font-supernova text-light-teal mb-4">Activities Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-josefin text-gray-300">Total Activities</span>
              <span className="font-josefin text-white font-semibold">
                {analytics.activities.total}
              </span>
            </div>
            {analytics.activities.byType.map((item: any) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="font-josefin text-gray-300">{item.type}</span>
                <span className="font-josefin text-white">{item._count.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string
  value: string | number
  icon: any
  color: string
  subtitle?: string
}) {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400 font-josefin">{title}</div>
        <Icon className={`text-${color}`} size={24} />
      </div>
      <div className={`text-3xl font-supernova text-${color} mb-1`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-500 font-josefin">{subtitle}</div>}
    </div>
  )
}
