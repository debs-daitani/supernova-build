'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ArrowLeft,
  Search,
  Grid,
  List,
  Lock,
  Star,
  Filter,
  FileText,
  Video,
  Download,
  Award,
  Layers,
  CheckCircle,
} from 'lucide-react'
import { UserRole, ContentType } from '@prisma/client'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  _count: { items: number }
}

interface ContentItem {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  type: ContentType
  requiredRole: UserRole
  isPremium: boolean
  hasAccess: boolean
  isBookmarked: boolean
  viewCount: number
  userProgress: {
    progress: number
    completedAt: Date | null
  } | null
  category: {
    name: string
  }
}

interface Props {
  categories: Category[]
  userRole: UserRole
  userId: string
}

export function ContentLibraryClient({ categories, userRole }: Props) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'free' | 'premium'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical'>('newest')

  useEffect(() => {
    fetchContent()
  }, [selectedCategory, searchQuery, filterBy, sortBy])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      if (filterBy !== 'all') params.append('filter', filterBy)
      params.append('sortBy', sortBy)

      const response = await fetch(`/api/content?${params}`)
      const data = await response.json()
      setContentItems(data)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'FRAMEWORK':
        return <Layers className="w-5 h-5" />
      case 'TEMPLATE':
        return <FileText className="w-5 h-5" />
      case 'WORKSHEET':
        return <FileText className="w-5 h-5" />
      case 'VIDEO':
        return <Video className="w-5 h-5" />
      case 'COURSE':
        return <Award className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      FREE: { text: 'Free', color: 'bg-gray-100 text-gray-700' },
      UPGRADE: { text: 'Upgrade', color: 'bg-purple-100 text-purple-700' },
      MEMBER: { text: 'Member', color: 'bg-pink-100 text-pink-700' },
    }
    return badges[role]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Content Library</h1>
              <p className="text-gray-600">
                Your exclusive collection of frameworks, templates, and resources
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories & Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Categories</h4>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                    selectedCategory === null
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name} ({category._count.items})
                  </button>
                ))}
              </div>

              {/* Access Level Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Access Level</h4>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Content</option>
                  <option value="free">Free Only</option>
                  <option value="premium">Members Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search & View Toggle */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Grid/List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading content...</p>
              </div>
            ) : contentItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Content Found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {contentItems.map((item) => (
                  <ContentCard key={item.id} item={item} getTypeIcon={getTypeIcon} getRoleBadge={getRoleBadge} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {contentItems.map((item) => (
                  <ContentListItem key={item.id} item={item} getTypeIcon={getTypeIcon} getRoleBadge={getRoleBadge} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentCard({ item, getTypeIcon, getRoleBadge }: any) {
  const badge = getRoleBadge(item.requiredRole)

  return (
    <Link href={`/content-library/${item.id}`}>
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              {getTypeIcon(item.type)}
            </div>
          )}
          {!item.hasAccess && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Lock className="w-12 h-12 text-white" />
            </div>
          )}
          {item.userProgress?.completedAt && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.color}`}>
              {badge.text}
            </span>
            {item.isBookmarked && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{item.category.name}</span>
            <span>{item.viewCount} views</span>
          </div>
          {item.userProgress && item.userProgress.progress > 0 && !item.userProgress.completedAt && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${item.userProgress.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function ContentListItem({ item, getTypeIcon, getRoleBadge }: any) {
  const badge = getRoleBadge(item.requiredRole)

  return (
    <Link href={`/content-library/${item.id}`}>
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-4 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group">
        <div className="flex gap-4">
          {/* Icon/Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center relative">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              getTypeIcon(item.type)
            )}
            {!item.hasAccess && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.userProgress?.completedAt && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {item.isBookmarked && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={`font-semibold px-2 py-1 rounded-full ${badge.color}`}>
                    {badge.text}
                  </span>
                  <span>{item.category.name}</span>
                  <span>{item.viewCount} views</span>
                </div>
              </div>
            </div>
            {item.userProgress && item.userProgress.progress > 0 && !item.userProgress.completedAt && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${item.userProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
