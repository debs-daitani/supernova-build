'use client'

import { useState, useEffect } from 'react'
import {
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TrafficSource {
  source: string
  visits: number
  percentage: number
}

interface DeviceBreakdown {
  type: string
  count: number
  percentage: number
}

export default function TrafficAnalyticsPage() {
  const [sources, setSources] = useState<TrafficSource[]>([])
  const [devices, setDevices] = useState<DeviceBreakdown[]>([])
  const [browsers, setBrowsers] = useState<DeviceBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    fetchTrafficData()
  }, [period])

  const fetchTrafficData = async () => {
    setLoading(true)
    try {
      const days = period === 'day' ? 1 : period === 'week' ? 7 : 30
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const res = await fetch(
        `/api/analytics/sessions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=1000`
      )
      const sessions = await res.json()

      // Aggregate traffic sources
      const sourceMap: { [key: string]: number } = {}
      const deviceMap: { [key: string]: number } = {}
      const browserMap: { [key: string]: number } = {}

      sessions.forEach((session: any) => {
        // UTM source tracking
        const source = session.utmSource || 'Direct'
        sourceMap[source] = (sourceMap[source] || 0) + 1

        // Device tracking
        const device = session.deviceType || 'Unknown'
        deviceMap[device] = (deviceMap[device] || 0) + 1

        // Browser tracking
        const browser = session.browser || 'Unknown'
        browserMap[browser] = (browserMap[browser] || 0) + 1
      })

      const totalSessions = sessions.length

      // Convert to arrays with percentages
      const sourceList: TrafficSource[] = Object.entries(sourceMap).map(
        ([source, visits]) => ({
          source,
          visits,
          percentage: totalSessions > 0 ? (visits / totalSessions) * 100 : 0,
        })
      )

      const deviceList: DeviceBreakdown[] = Object.entries(deviceMap).map(
        ([type, count]) => ({
          type,
          count,
          percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0,
        })
      )

      const browserList: DeviceBreakdown[] = Object.entries(browserMap).map(
        ([type, count]) => ({
          type,
          count,
          percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0,
        })
      )

      sourceList.sort((a, b) => b.visits - a.visits)
      deviceList.sort((a, b) => b.count - a.count)
      browserList.sort((a, b) => b.count - a.count)

      setSources(sourceList)
      setDevices(deviceList)
      setBrowsers(browserList)
    } catch (error) {
      console.error('Error fetching traffic data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSourceIcon = (source: string) => {
    const lower = source.toLowerCase()
    if (lower.includes('facebook')) return Facebook
    if (lower.includes('twitter')) return Twitter
    if (lower.includes('linkedin')) return Linkedin
    if (lower.includes('google')) return Chrome
    return Globe
  }

  const getDeviceIcon = (device: string) => {
    const lower = device.toLowerCase()
    if (lower.includes('mobile')) return Smartphone
    if (lower.includes('tablet')) return Tablet
    return Monitor
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Traffic Analytics
            </h1>
            <p className="text-gray-600">Track traffic sources and visitor behavior</p>
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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading traffic data...</p>
          </div>
        ) : (
          <>
            {/* Traffic Sources */}
            <Card className="p-6 mb-8">
              <h3 className="font-bold text-lg mb-4">Traffic Sources</h3>
              {sources.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No traffic data available</p>
              ) : (
                <div className="space-y-3">
                  {sources.map((source, index) => {
                    const Icon = getSourceIcon(source.source)
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{source.source}</span>
                            <span className="text-sm text-gray-600">
                              {source.visits} visits ({source.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                              style={{ width: `${source.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Device & Browser Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Device Types */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Device Types</h3>
                {devices.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No device data available</p>
                ) : (
                  <div className="space-y-3">
                    {devices.map((device, index) => {
                      const Icon = getDeviceIcon(device.type)
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{device.type}</span>
                              <span className="text-sm text-gray-600">
                                {device.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                style={{ width: `${device.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Browsers */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Browsers</h3>
                {browsers.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No browser data available</p>
                ) : (
                  <div className="space-y-3">
                    {browsers.map((browser, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <Chrome className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{browser.type}</span>
                            <span className="text-sm text-gray-600">
                              {browser.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${browser.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Geographic Data */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Top Countries</h3>
              <p className="text-center py-8 text-gray-500">
                Geographic data will be available after integrating IP geolocation service
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
