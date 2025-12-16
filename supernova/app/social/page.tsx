'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Share2, Clock, CheckCircle, AlertCircle, Instagram, Facebook, Linkedin } from 'lucide-react'

interface SocialAccount {
  id: string
  platform: string
  accountName: string
  profileImage: string | null
  isActive: boolean
  tokenExpired: boolean
}

interface SocialPost {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledFor: string | null
  publishedAt: string | null
  createdAt: string
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Share2, // TikTok icon not in lucide, using Share2
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'from-purple-500 to-pink-500',
  facebook: 'from-blue-600 to-blue-500',
  linkedin: 'from-blue-700 to-blue-600',
  tiktok: 'from-black to-gray-800',
}

export default function SocialDashboard() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [accountsRes, postsRes] = await Promise.all([
        fetch('/api/social/accounts'),
        fetch('/api/social/posts?limit=10')
      ])

      if (accountsRes.ok) {
        const data = await accountsRes.json()
        setAccounts(data)
      }

      if (postsRes.ok) {
        const data = await postsRes.json()
        setRecentPosts(data.posts.filter((p: SocialPost) => p.status === 'published').slice(0, 5))
        setScheduledPosts(data.posts.filter((p: SocialPost) => p.status === 'scheduled').slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Social Media Dashboard</h2>
          <p className="text-sm text-gray-400 font-josefin">Manage all your social accounts in one place</p>
        </div>
        <Link
          href="/social/compose"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-purple-500 text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.3)] transition-all"
        >
          <Plus size={18} />
          New Post
        </Link>
      </div>

      {/* Connected Accounts */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-supernova text-light-teal">Connected Accounts</h3>
          <Link
            href="/social/settings"
            className="text-sm text-hot-pink font-josefin hover:underline"
          >
            Manage Accounts
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Share2 className="mx-auto mb-3 text-gray-500" size={40} />
            <p className="text-gray-400 font-josefin">No accounts connected yet</p>
            <Link
              href="/social/settings"
              className="inline-block mt-3 px-4 py-2 rounded-lg bg-hot-pink/20 text-hot-pink font-josefin hover:bg-hot-pink/30 transition-all"
            >
              Connect an Account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((account) => {
              const Icon = PLATFORM_ICONS[account.platform] || Share2
              const gradient = PLATFORM_COLORS[account.platform] || 'from-gray-600 to-gray-500'

              return (
                <div
                  key={account.id}
                  className="relative p-4 rounded-xl bg-black/30 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-josefin text-white truncate">{account.accountName}</p>
                      <p className="text-xs text-gray-400 font-josefin capitalize">{account.platform}</p>
                    </div>
                  </div>
                  {account.tokenExpired && (
                    <div className="absolute top-2 right-2">
                      <AlertCircle size={16} className="text-yellow-500" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Share2 className="text-light-teal" size={24} />
            <span className="text-sm text-gray-400 font-josefin">Connected Accounts</span>
          </div>
          <p className="text-3xl font-supernova text-white">{accounts.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-hot-pink/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-hot-pink" size={24} />
            <span className="text-sm text-gray-400 font-josefin">Scheduled Posts</span>
          </div>
          <p className="text-3xl font-supernova text-white">{scheduledPosts.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-green-500/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <span className="text-sm text-gray-400 font-josefin">Published This Week</span>
          </div>
          <p className="text-3xl font-supernova text-white">{recentPosts.length}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Posts */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-supernova text-light-teal flex items-center gap-2">
              <Clock size={20} />
              Upcoming Posts
            </h3>
            <Link
              href="/social/scheduled"
              className="text-sm text-hot-pink font-josefin hover:underline"
            >
              View All
            </Link>
          </div>

          {scheduledPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-josefin">
              <p>No scheduled posts</p>
              <Link href="/social/compose" className="text-hot-pink hover:underline">
                Schedule your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg bg-black/30 border border-white/10"
                >
                  <p className="text-white font-josefin text-sm line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {(post.platforms as string[]).map((platform) => {
                        const Icon = PLATFORM_ICONS[platform] || Share2
                        return <Icon key={platform} size={14} className="text-gray-400" />
                      })}
                    </div>
                    <span className="text-xs text-gray-400 font-josefin">
                      {post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-supernova text-light-teal flex items-center gap-2">
              <CheckCircle size={20} />
              Recent Posts
            </h3>
            <Link
              href="/social/published"
              className="text-sm text-hot-pink font-josefin hover:underline"
            >
              View All
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-josefin">
              <p>No published posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg bg-black/30 border border-white/10"
                >
                  <p className="text-white font-josefin text-sm line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {(post.platforms as string[]).map((platform) => {
                        const Icon = PLATFORM_ICONS[platform] || Share2
                        return <Icon key={platform} size={14} className="text-gray-400" />
                      })}
                    </div>
                    <span className="text-xs text-green-400 font-josefin">
                      Published {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB') : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
