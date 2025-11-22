'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { MessageSquare, Trophy, ThumbsUp, Calendar, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatTimeAgo, getInitials } from '@/lib/forum-utils'
import { BADGES } from '@/lib/forum-config'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params)
  const [user, setUser] = useState<any>(null)
  const [reputation, setReputation] = useState<any>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      const [repRes, threadsRes] = await Promise.all([
        fetch(`/api/forum/reputation/${userId}`),
        fetch(`/api/forum/threads?userId=${userId}&limit=10`),
      ])

      const repData = await repRes.json()
      const threadsData = await threadsRes.json()

      setReputation(repData)
      setUser(repData.user)
      setThreads(threadsData.threads || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user?.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials(user?.name || user?.username || 'U')}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user?.name || user?.username}
              </h1>
              {user?.bio && <p className="text-gray-600 mb-4">{user.bio}</p>}

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatTimeAgo(new Date(user?.createdAt))}</span>
                </div>
              </div>

              {/* Reputation Level */}
              <div className="flex items-center gap-3">
                <div
                  className="px-4 py-2 rounded-full font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${reputation?.levelInfo?.color}, ${reputation?.levelInfo?.color}dd)`,
                  }}
                >
                  {reputation?.levelInfo?.label}
                </div>
                <span className="text-lg font-bold">{reputation?.points || 0} points</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Badges */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Threads</span>
                  </div>
                  <span className="font-semibold">{reputation?.threadsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Posts</span>
                  </div>
                  <span className="font-semibold">{reputation?.postsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Helpful</span>
                  </div>
                  <span className="font-semibold">{reputation?.helpfulCount || 0}</span>
                </div>
              </div>
            </Card>

            {/* Badges */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Badges ({reputation?.badges?.length || 0})
              </h3>
              {reputation?.badges && reputation.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {reputation.badges.map((badgeId: string) => {
                    const badge = BADGES.find((b) => b.id === badgeId)
                    if (!badge) return null

                    return (
                      <div
                        key={badgeId}
                        className="p-3 border rounded-lg text-center hover:shadow-md transition-shadow"
                        title={badge.description}
                      >
                        <Award
                          className="w-8 h-8 mx-auto mb-2"
                          style={{ color: badge.color }}
                        />
                        <p className="text-xs font-medium">{badge.name}</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No badges earned yet</p>
              )}
            </Card>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Recent Threads</h3>
              {threads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No threads yet</p>
              ) : (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/community/${thread.category.slug}/${thread.slug}`}
                    >
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="font-semibold mb-2">{thread.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{thread.category.name}</span>
                          <span>•</span>
                          <span>{thread.replyCount} replies</span>
                          <span>•</span>
                          <span>{formatTimeAgo(new Date(thread.createdAt))}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
