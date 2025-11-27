'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, Eye, MousePointer, TrendingUp, TrendingDown } from 'lucide-react'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/email/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl font-josefin">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-8">
        <p className="text-white font-josefin">No analytics data available</p>
      </div>
    )
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Subscribers',
      value: analytics.totalSubscribers || 0,
      change: analytics.subscriberGrowth || 0,
      color: 'from-hot-pink to-light-teal'
    },
    {
      icon: Mail,
      label: 'Campaigns Sent',
      value: analytics.totalCampaigns || 0,
      change: analytics.campaignGrowth || 0,
      color: 'from-light-teal to-neon-lime'
    },
    {
      icon: Eye,
      label: 'Avg Open Rate',
      value: `${analytics.avgOpenRate || 0}%`,
      change: analytics.openRateChange || 0,
      color: 'from-neon-lime to-hot-pink'
    },
    {
      icon: MousePointer,
      label: 'Avg Click Rate',
      value: `${analytics.avgClickRate || 0}%`,
      change: analytics.clickRateChange || 0,
      color: 'from-hot-pink to-light-teal'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-supernova text-white">Email Marketing Analytics</h2>
        <p className="text-sm text-gray-400 font-josefin">Overall performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0

          return (
            <div
              key={stat.label}
              className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="text-light-teal" size={32} />
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-josefin ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div className="text-3xl font-supernova text-transparent bg-clip-text bg-gradient-to-r ${stat.color}">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 font-josefin mt-1">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Subscriber Status Breakdown */}
      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
        <h3 className="text-xl font-supernova text-hot-pink mb-6">Subscriber Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10">
            <div className="text-2xl font-supernova text-green-400">{analytics.subscribedCount || 0}</div>
            <div className="text-sm text-gray-400 font-josefin">Subscribed</div>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10">
            <div className="text-2xl font-supernova text-red-400">{analytics.unsubscribedCount || 0}</div>
            <div className="text-sm text-gray-400 font-josefin">Unsubscribed</div>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10">
            <div className="text-2xl font-supernova text-yellow-400">{analytics.bouncedCount || 0}</div>
            <div className="text-sm text-gray-400 font-josefin">Bounced</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10">
            <div className="text-2xl font-supernova text-purple-400">{analytics.complainedCount || 0}</div>
            <div className="text-sm text-gray-400 font-josefin">Complained</div>
          </div>
        </div>
      </div>

      {/* Top Campaigns */}
      {analytics.topCampaigns && analytics.topCampaigns.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
          <h3 className="text-xl font-supernova text-hot-pink mb-6">Top Performing Campaigns</h3>
          <div className="space-y-4">
            {analytics.topCampaigns.map((campaign: any) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex-1">
                  <p className="text-white font-josefin font-bold">{campaign.name}</p>
                  <p className="text-sm text-gray-400 font-josefin">{campaign.subject}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-white font-josefin font-bold">{campaign.sentCount}</div>
                    <div className="text-gray-400 font-josefin text-xs">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-josefin font-bold">
                      {campaign.sentCount ? ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-gray-400 font-josefin text-xs">Opens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-josefin font-bold">
                      {campaign.sentCount ? ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-gray-400 font-josefin text-xs">Clicks</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriber Growth Chart */}
      {analytics.growthTrend && analytics.growthTrend.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
          <h3 className="text-xl font-supernova text-hot-pink mb-6">Subscriber Growth (Last 30 Days)</h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {analytics.growthTrend.map((point: any, index: number) => {
              const maxValue = Math.max(...analytics.growthTrend.map((p: any) => p.count))
              const height = (point.count / maxValue) * 100

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-hot-pink to-light-teal rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                    title={`${point.date}: ${point.count} subscribers`}
                  />
                  <div className="text-xs text-gray-400 font-josefin mt-2 rotate-45 origin-left">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
        <h3 className="text-xl font-supernova text-hot-pink mb-6">Engagement Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
              {analytics.totalOpens || 0}
            </div>
            <div className="text-gray-400 font-josefin">Total Opens</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              {analytics.totalClicks || 0}
            </div>
            <div className="text-gray-400 font-josefin">Total Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
              {analytics.totalSent || 0}
            </div>
            <div className="text-gray-400 font-josefin">Total Emails Sent</div>
          </div>
        </div>
      </div>

      {/* Subscriber Sources */}
      {analytics.subscriberSources && Object.keys(analytics.subscriberSources).length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
          <h3 className="text-xl font-supernova text-hot-pink mb-6">Subscriber Sources</h3>
          <div className="space-y-3">
            {Object.entries(analytics.subscriberSources).map(([source, count]: [string, any]) => {
              const percentage = ((count / analytics.totalSubscribers) * 100).toFixed(1)

              return (
                <div key={source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-josefin capitalize">{source.toLowerCase()}</span>
                    <span className="text-gray-400 font-josefin">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-hot-pink to-light-teal h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
