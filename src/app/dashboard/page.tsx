import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Sparkles, BookOpen, GraduationCap, Settings, Target, Star, Crown } from 'lucide-react'
import { formatDistanceToNow, differenceInDays, format } from 'date-fns'
import { enGB } from 'date-fns/locale'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch user data with profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  })

  if (!user) {
    redirect('/login')
  }

  // Calculate days since joined
  const daysSinceJoined = differenceInDays(new Date(), user.createdAt)
  const joinDate = format(user.createdAt, 'dd MMMM yyyy', { locale: enGB })

  // Fetch recent progress
  const recentProgress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      completedAt: null, // Only show in-progress items
    },
    include: {
      content: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 3,
  })

  // Fetch bookmarked content
  const bookmarkedContent = await prisma.contentBookmark.findMany({
    where: { userId: session.user.id },
    include: {
      content: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  // Get account type styling
  const accountTypeStyles = {
    FREE: {
      icon: Target,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    UPGRADE: {
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    MEMBER: {
      icon: Crown,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
    },
  }

  const accountStyle = accountTypeStyles[user.role]
  const AccountIcon = accountStyle.icon
  const firstName = user.profile?.firstName || 'Friend'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Your personalised dAItaniverse dashboard
          </p>
        </div>

        {/* Continue Learning Widget */}
        {(recentProgress.length > 0 || bookmarkedContent.length > 0) && (
          <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Continue Learning
            </h2>

            {recentProgress.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">In Progress</h3>
                <div className="space-y-3">
                  {recentProgress.map((progress) => (
                    <Link
                      key={progress.id}
                      href={`/content-library/${progress.content.id}`}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          {progress.content.title}
                        </p>
                        <p className="text-xs text-gray-600">{progress.content.category.name}</p>
                      </div>
                      <div className="w-24">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 text-right">{progress.progress}%</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {bookmarkedContent.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Bookmarked</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {bookmarkedContent.map((bookmark) => (
                    <Link
                      key={bookmark.id}
                      href={`/content-library/${bookmark.content.id}`}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all group"
                    >
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600 mb-2" />
                      <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {bookmark.content.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{bookmark.content.category.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Account Type Card */}
          <div
            className={`${accountStyle.bgColor} ${accountStyle.borderColor} border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Account Type</p>
                <p className={`text-3xl font-bold ${accountStyle.color} flex items-center gap-2`}>
                  {user.role === 'FREE' && '🎯'}
                  {user.role === 'UPGRADE' && '⭐'}
                  {user.role === 'MEMBER' && '👑'}
                  {user.role}
                </p>
              </div>
              <AccountIcon className={`w-12 h-12 ${accountStyle.color}`} />
            </div>
          </div>

          {/* Days Since Joined Card */}
          <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
                <p className="text-3xl font-bold text-purple-600">
                  {daysSinceJoined === 0 ? 'Today! 🎉' : `${daysSinceJoined} days`}
                </p>
                <p className="text-xs text-gray-500 mt-1">Joined {joinDate}</p>
              </div>
              <div className="text-5xl">📅</div>
            </div>
          </div>
        </div>

        {/* Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SUPERNova AI Tile */}
          <Link
            href="/supernova"
            className="group bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="text-white">
              <Sparkles className="w-12 h-12 mb-4 group-hover:rotate-12 transition-transform" />
              <h3 className="text-xl font-bold mb-2">SUPERNova AI</h3>
              <p className="text-sm text-pink-100">
                Your intelligent AI companion for personalised guidance
              </p>
            </div>
          </Link>

          {/* Content Library Tile */}
          <Link
            href="/content-library"
            className="group bg-white border-2 border-pink-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="text-gray-800">
              <BookOpen className="w-12 h-12 mb-4 text-pink-500 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Content Library</h3>
              <p className="text-sm text-gray-600">
                Access exclusive resources, guides, and materials
              </p>
            </div>
          </Link>

          {/* Programs Tile */}
          <Link
            href="/programs"
            className="group bg-white border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer relative"
          >
            <div className="absolute top-4 right-4">
              <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                COMING SOON
              </span>
            </div>
            <div className="text-gray-800">
              <GraduationCap className="w-12 h-12 mb-4 text-purple-500 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Programs</h3>
              <p className="text-sm text-gray-600">
                Explore transformative programmes and courses
              </p>
            </div>
          </Link>

          {/* Settings Tile */}
          <Link
            href="/settings"
            className="group bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="text-gray-800">
              <Settings className="w-12 h-12 mb-4 text-gray-600 group-hover:rotate-90 transition-transform duration-500" />
              <h3 className="text-xl font-bold mb-2">Settings</h3>
              <p className="text-sm text-gray-600">
                Manage your account and preferences
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
