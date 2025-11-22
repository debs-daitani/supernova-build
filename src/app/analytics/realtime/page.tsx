'use client'

import { useState, useEffect } from 'react'
import { Activity, Users, MousePointerClick, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface RealtimeData {
  activeUsers: number
  activeSessions: number
  pageViews: number
  avgSessionDuration: number
  recentEvents: any[]
}

export default function RealtimeAnalyticsPage() {
  const [data, setData] = useState<RealtimeData>({
    activeUsers: 0,
    activeSessions: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    recentEvents: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealtimeData()
    const interval = setInterval(fetchRealtimeData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchRealtimeData = async () => {
    try {
      // Get sessions from last 5 minutes
      const fiveMinutesAgo = new Date()
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

      const res = await fetch(
        `/api/analytics/sessions?startDate=${fiveMinutesAgo.toISOString()}&endDate=${new Date().toISOString()}&limit=100`
      )
      const sessions = await res.json()

      // Get recent events
      const eventsRes = await fetch(
        `/api/analytics/events?startDate=${fiveMinutesAgo.toISOString()}&endDate=${new Date().toISOString()}&limit=20`
      )
      const events = await eventsRes.json()

      const activeUsers = new Set(sessions.map((s: any) => s.userId).filter(Boolean)).size
      const pageViews = events.filter((e: any) => e.eventCategory === 'PAGE_VIEW').length
      const avgDuration =
        sessions.length > 0
          ? sessions.reduce((sum: number, s: any) => {
              const duration =
                s.endedAt && s.startedAt
                  ? (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000
                  : 0
              return sum + duration
            }, 0) / sessions.length
          : 0

      setData({
        activeUsers,
        activeSessions: sessions.length,
        pageViews,
        avgSessionDuration: avgDuration,
        recentEvents: events,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching realtime data:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Real-time Analytics
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse text-green-500" />
              Live user activity and current sessions
            </p>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center relative">
                <Users className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold">{data.activeUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold">{data.activeSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Page Views (5min)</p>
                <p className="text-3xl font-bold">{data.pageViews}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Session</p>
                <p className="text-3xl font-bold">
                  {Math.floor(data.avgSessionDuration / 60)}m {Math.floor(data.avgSessionDuration % 60)}s
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-500" />
            Live Activity Feed
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : data.recentEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>No recent activity</p>
              <p className="text-sm mt-2">Waiting for user events...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.recentEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {event.eventType.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {event.deviceType} • {event.browser}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Active Pages */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Active Pages</h3>
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm">Real-time page tracking available via WebSocket</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
