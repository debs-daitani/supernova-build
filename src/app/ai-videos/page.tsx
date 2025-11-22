'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Film, Play, Wand2, Zap, Clock, TrendingUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TIER_LIMITS } from '@/lib/ai-video-config'

export default function AIVideosHomePage() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState<'BRAVE' | 'BOLD' | 'BADASS'>('BOLD')
  const [monthlyUsage, setMonthlyUsage] = useState(0)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const userId = 'user_placeholder' // TODO: Get from auth
      const res = await fetch(`/api/ai-videos?userId=${userId}&limit=6`)
      const data = await res.json()
      setVideos(data.videos || [])

      // Calculate monthly usage
      const currentMonth = new Date().toISOString().substring(0, 7)
      const monthlyVideos = data.videos.filter((v: any) =>
        v.createdAt.startsWith(currentMonth)
      )
      setMonthlyUsage(monthlyVideos.length)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const tierLimits = TIER_LIMITS[userTier]
  const quotaRemaining =
    tierLimits.monthlyQuota === -1
      ? 'Unlimited'
      : tierLimits.monthlyQuota - monthlyUsage

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Film className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-4">
            AI Video Generation
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your ideas into stunning videos with AI. Create cinematic scenes,
            animations, and product demos in seconds.
          </p>

          {/* Quota Display */}
          <div className="flex justify-center gap-4 mb-8">
            <Card className="p-4 min-w-[200px]">
              <div className="text-sm text-gray-600 mb-1">Monthly Quota</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {monthlyUsage} / {tierLimits.monthlyQuota === -1 ? '∞' : tierLimits.monthlyQuota}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {quotaRemaining === 'Unlimited'
                  ? 'Unlimited generations'
                  : `${quotaRemaining} remaining`}
              </div>
            </Card>

            <Card className="p-4 min-w-[200px]">
              <div className="text-sm text-gray-600 mb-1">Current Plan</div>
              <div className="text-2xl font-bold text-purple-600">{userTier}</div>
              <div className="text-xs text-gray-500 mt-1">
                Max {tierLimits.maxDuration}s videos
              </div>
            </Card>
          </div>

          {!tierLimits.canGenerate ? (
            <Card className="p-6 max-w-2xl mx-auto bg-yellow-50 border-yellow-200 mb-8">
              <h3 className="font-bold text-yellow-800 mb-2">Upgrade Required</h3>
              <p className="text-yellow-700 mb-4">
                AI video generation is not available on the BRAVE plan. Upgrade to BOLD or
                BADASS to start creating videos.
              </p>
              <Link href="/settings/billing">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Upgrade Now
                </Button>
              </Link>
            </Card>
          ) : quotaRemaining === 0 ? (
            <Card className="p-6 max-w-2xl mx-auto bg-yellow-50 border-yellow-200 mb-8">
              <h3 className="font-bold text-yellow-800 mb-2">Quota Exceeded</h3>
              <p className="text-yellow-700 mb-4">
                You've used all {tierLimits.monthlyQuota} videos this month. Upgrade to BADASS
                for unlimited generation.
              </p>
              <Link href="/settings/billing">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Upgrade to BADASS
                </Button>
              </Link>
            </Card>
          ) : (
            <Link href="/ai-videos/generate">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg px-8 py-6">
                <Wand2 className="w-5 h-5 mr-2" />
                Generate New Video
              </Button>
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              Generate high-quality videos in 30-120 seconds with state-of-the-art AI models
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Multiple Styles</h3>
            <p className="text-gray-600 text-sm">
              Cinematic, animation, realistic, artistic, and product demo styles available
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Pro Quality</h3>
            <p className="text-gray-600 text-sm">
              Up to 1080p resolution with smooth motion and professional cinematography
            </p>
          </Card>
        </div>

        {/* Recent Videos */}
        {videos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Generations</h2>
              <Link href="/ai-videos/gallery">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Link key={video.id} href={`/ai-videos/${video.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative group">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.prompt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-16 h-16 text-gray-400" />
                        )}
                        {video.status === 'COMPLETED' && (
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        {video.status !== 'COMPLETED' && (
                          <div className="absolute top-2 right-2 px-3 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full">
                            {video.status}
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                          {video.duration}s
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {video.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="capitalize">{video.style.toLowerCase()}</span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/ai-videos/generate">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Plus className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold mb-1">Generate Video</h3>
              <p className="text-sm text-gray-600">Create a new AI video</p>
            </Card>
          </Link>

          <Link href="/ai-videos/templates">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Film className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold mb-1">Templates</h3>
              <p className="text-sm text-gray-600">Browse video templates</p>
            </Card>
          </Link>

          <Link href="/ai-videos/gallery">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Play className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold mb-1">Gallery</h3>
              <p className="text-sm text-gray-600">View all your videos</p>
            </Card>
          </Link>

          <Link href="/ai-videos/queue">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Clock className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold mb-1">Queue</h3>
              <p className="text-sm text-gray-600">Check generation status</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
