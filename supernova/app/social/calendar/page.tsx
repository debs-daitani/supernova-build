'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, Instagram, Facebook, Linkedin, Share2 } from 'lucide-react'

interface SocialPost {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledFor: string
  publishedAt: string
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Share2,
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchPosts()
  }, [currentDate])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts.filter((p: SocialPost) =>
          p.status === 'scheduled' || p.status === 'published'
        ))
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = post.scheduledFor
        ? new Date(post.scheduledFor)
        : post.publishedAt
          ? new Date(post.publishedAt)
          : null

      if (!postDate) return false

      return (
        postDate.getFullYear() === date.getFullYear() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getDate() === date.getDate()
      )
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Content Calendar</h2>
          <p className="text-sm text-gray-400 font-josefin">View your scheduled and published posts</p>
        </div>
        <Link
          href="/social/compose"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-purple-500 text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.3)] transition-all"
        >
          <Plus size={18} />
          New Post
        </Link>
      </div>

      {/* Calendar */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h3 className="text-xl font-supernova text-white">
              {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-400 font-josefin text-sm hover:bg-white/20 transition-all"
          >
            Today
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-supernova text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="min-h-[100px] border-r border-b border-white/5" />
            }

            const dayPosts = getPostsForDate(date)
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border-r border-b border-white/5 ${
                  isToday ? 'bg-hot-pink/10' : ''
                }`}
              >
                <div
                  className={`text-sm font-josefin mb-2 ${
                    isToday ? 'text-hot-pink font-bold' : 'text-gray-400'
                  }`}
                >
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={post.status === 'scheduled' ? '/social/scheduled' : '/social/published'}
                      className={`block p-1.5 rounded text-xs truncate transition-all ${
                        post.status === 'scheduled'
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {(post.platforms as string[]).slice(0, 2).map((platform) => {
                          const Icon = PLATFORM_ICONS[platform] || Share2
                          return <Icon key={platform} size={10} />
                        })}
                        <span className="truncate">{post.content.substring(0, 20)}...</span>
                      </div>
                    </Link>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-gray-500 font-josefin">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/50" />
          <span className="text-sm text-gray-400 font-josefin">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/50" />
          <span className="text-sm text-gray-400 font-josefin">Published</span>
        </div>
      </div>
    </div>
  )
}
