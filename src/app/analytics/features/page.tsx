'use client'

import { useState, useEffect } from 'react'
import {
  Globe,
  Palette,
  Image,
  Video,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FeatureUsage {
  feature: string
  count: number
  users: number
  avgPerUser: number
  trend: number
}

export default function FeaturesAnalyticsPage() {
  const [features, setFeatures] = useState<FeatureUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    fetchFeatureUsage()
  }, [period])

  const fetchFeatureUsage = async () => {
    setLoading(true)
    try {
      const days = period === 'day' ? 1 : period === 'week' ? 7 : 30
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const res = await fetch(
        `/api/analytics/events?eventCategory=FEATURE_USE&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=1000`
      )
      const events = await res.json()

      // Aggregate feature usage
      const usageMap: { [key: string]: { count: number; users: Set<string> } } = {}

      events.forEach((event: any) => {
        const feature = event.eventType
        if (!usageMap[feature]) {
          usageMap[feature] = { count: 0, users: new Set() }
        }
        usageMap[feature].count++
        if (event.userId) {
          usageMap[feature].users.add(event.userId)
        }
      })

      const featureList: FeatureUsage[] = Object.entries(usageMap).map(
        ([feature, data]) => ({
          feature,
          count: data.count,
          users: data.users.size,
          avgPerUser: data.users.size > 0 ? data.count / data.users.size : 0,
          trend: Math.random() * 20 - 10, // TODO: Calculate actual trend
        })
      )

      featureList.sort((a, b) => b.count - a.count)
      setFeatures(featureList)
    } catch (error) {
      console.error('Error fetching feature usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('website')) return Globe
    if (feature.includes('design')) return Palette
    if (feature.includes('image')) return Image
    if (feature.includes('video')) return Video
    return BarChart3
  }

  const getFeatureName = (feature: string) => {
    return feature
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Feature Analytics
            </h1>
            <p className="text-gray-600">Track feature usage and adoption</p>
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

        {/* Feature Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Website Builder</p>
                <p className="text-2xl font-bold">
                  {features
                    .filter((f) => f.feature.includes('website'))
                    .reduce((sum, f) => sum + f.count, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Design Tools</p>
                <p className="text-2xl font-bold">
                  {features
                    .filter((f) => f.feature.includes('design'))
                    .reduce((sum, f) => sum + f.count, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">AI Images</p>
                <p className="text-2xl font-bold">
                  {features
                    .filter((f) => f.feature.includes('image'))
                    .reduce((sum, f) => sum + f.count, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Video Editor</p>
                <p className="text-2xl font-bold">
                  {features
                    .filter((f) => f.feature.includes('video'))
                    .reduce((sum, f) => sum + f.count, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Usage Table */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Feature Usage Breakdown</h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : features.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No feature usage data available for this period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-right py-3 px-4">Total Uses</th>
                    <th className="text-right py-3 px-4">Unique Users</th>
                    <th className="text-right py-3 px-4">Avg/User</th>
                    <th className="text-right py-3 px-4">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => {
                    const Icon = getFeatureIcon(feature.feature)
                    const isPositive = feature.trend >= 0

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">
                              {getFeatureName(feature.feature)}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {feature.count.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {feature.users.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {feature.avgPerUser.toFixed(1)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={`flex items-center justify-end gap-1 ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            <TrendingUp
                              className={`w-4 h-4 ${
                                !isPositive ? 'rotate-180' : ''
                              }`}
                            />
                            {Math.abs(feature.trend).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
