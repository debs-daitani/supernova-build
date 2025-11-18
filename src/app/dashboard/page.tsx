'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  subscriptionTier: string
  subscriptionStatus: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) throw new Error('Failed to fetch user')

      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-daitani-pink text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const canAccessSupernova = ['UPGRADE', 'MEMBER', 'ADMIN'].includes(user.role)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-daitani-pink">
            The dAItaniverse
          </h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-daitani-pink to-daitani-cyan text-white rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">
            Welcome back, {user.name || 'Entrepreneur'}! 🚀
          </h2>
          <p className="text-lg">
            Ready to build your empire? Let's fucking go!
          </p>
        </div>

        {/* Subscription Status */}
        {user.role === 'FREE' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-yellow-900 mb-2">
              Unlock Your Full Potential
            </h3>
            <p className="text-yellow-800 mb-4">
              You're on the free tier. Upgrade for just £26 to access SUPERNova AI coaching, content library, and more!
            </p>
            <Link
              href="/upgrade"
              className="inline-block bg-daitani-pink text-white px-6 py-3 rounded-lg font-bold hover:bg-daitani-pink/90"
            >
              Upgrade Now - £26
            </Link>
          </div>
        )}

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SUPERNova AI */}
          <Link
            href={canAccessSupernova ? '/supernova' : '/upgrade'}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-daitani-pink rounded-lg flex items-center justify-center text-white text-2xl">
                🤖
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">SUPERNova AI</h3>
            </div>
            <p className="text-gray-600">
              Your personal AI coach. Chat, plan, strategise, and learn.
            </p>
            {!canAccessSupernova && (
              <p className="mt-2 text-sm text-daitani-pink font-bold">
                Upgrade to unlock →
              </p>
            )}
          </Link>

          {/* i•DEA Marketplace */}
          <Link
            href="/marketplace"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-daitani-cyan rounded-lg flex items-center justify-center text-white text-2xl">
                💡
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">i•DEA Marketplace</h3>
            </div>
            <p className="text-gray-600">
              Buy, sell, and collaborate on business ideas. Turn "failures" into assets.
            </p>
          </Link>

          {/* The Venue (Community) */}
          <Link
            href="/community"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-2xl">
                👥
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">The Venue</h3>
            </div>
            <p className="text-gray-600">
              Connect with fellow midlife entrepreneurs. Share, support, celebrate.
            </p>
          </Link>

          {/* Content Library */}
          <Link
            href={canAccessSupernova ? '/library' : '/upgrade'}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl">
                📚
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">Content Library</h3>
            </div>
            <p className="text-gray-600">
              Courses, frameworks, templates. Curated learning paths just for you.
            </p>
            {!canAccessSupernova && (
              <p className="mt-2 text-sm text-daitani-pink font-bold">
                Upgrade to unlock →
              </p>
            )}
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white text-2xl">
                ⚙️
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">Profile & Settings</h3>
            </div>
            <p className="text-gray-600">
              Manage your account, preferences, and subscription.
            </p>
          </Link>

          {/* Admin (if admin) */}
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-daitani-pink"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-daitani-pink rounded-lg flex items-center justify-center text-white text-2xl">
                  🔧
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">Admin Dashboard</h3>
              </div>
              <p className="text-gray-600">
                Manage users, content, marketplace, and analytics.
              </p>
            </Link>
          )}
        </div>

        {/* Three Pillars Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Your Three Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-xl font-bold mb-2 text-red-600">Confident Body</h3>
              <p className="text-gray-600">
                Physical confidence, health, and navigating midlife body changes.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-xl font-bold mb-2 text-purple-600">Confident Brain</h3>
              <p className="text-gray-600">
                Mindset, ADHD support, mental health, and breaking limiting beliefs.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-bold mb-2 text-blue-600">Confident Business</h3>
              <p className="text-gray-600">
                Entrepreneurship, strategy, marketing, sales, and operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
