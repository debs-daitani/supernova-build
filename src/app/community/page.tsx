'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Users,
  TrendingUp,
  Plus,
  Rocket,
  Briefcase,
  Brain,
  Trophy,
  Wrench,
  Coffee,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatTimeAgo } from '@/lib/forum-utils'

const CATEGORY_ICONS: any = {
  Rocket,
  Briefcase,
  Brain,
  Trophy,
  Wrench,
  Coffee,
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  threadCount: number
  postCount: number
  latestThread?: any
}

export default function CommunityHomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/forum/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
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
              Community Forum
            </h1>
            <p className="text-gray-600">
              Connect, share, and learn with fellow midlife entrepreneurs
            </p>
          </div>

          <Link href="/community/new">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Threads</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + cat.threadCount, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + cat.postCount, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Categories */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading categories...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.icon] || MessageSquare

              return (
                <Link key={category.id} href={`/community/${category.slug}`}>
                  <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                        }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Category Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {category.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{category.threadCount} threads</span>
                          <span>•</span>
                          <span>{category.postCount} posts</span>
                        </div>
                      </div>

                      {/* Latest Activity */}
                      {category.latestThread && (
                        <div className="hidden md:block text-sm text-right">
                          <p className="text-gray-700 font-medium truncate max-w-xs">
                            {category.latestThread.title}
                          </p>
                          <p className="text-gray-500">
                            by {category.latestThread.user.name || category.latestThread.user.username}
                          </p>
                          <p className="text-gray-400">
                            {formatTimeAgo(new Date(category.latestThread.lastActivityAt))}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* Community Guidelines */}
        <Card className="p-6 mt-8 bg-gradient-to-br from-pink-50 to-purple-50">
          <h3 className="font-bold text-lg mb-3">Community Guidelines</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Be respectful and supportive of fellow entrepreneurs</li>
            <li>• Share your experiences and learn from others</li>
            <li>• Keep discussions on-topic and constructive</li>
            <li>• No spam, self-promotion, or harassment</li>
            <li>• Celebrate wins and support challenges</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
