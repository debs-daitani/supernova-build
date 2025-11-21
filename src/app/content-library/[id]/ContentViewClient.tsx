'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Lock,
  Star,
  Download,
  Play,
  CheckCircle,
  Sparkles,
  Eye,
  BookOpen,
  FileText,
  Video,
  Award,
  Layers,
} from 'lucide-react'
import { ContentType, UserRole } from '@prisma/client'

interface ContentItem {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  type: ContentType
  fileUrl: string | null
  videoUrl: string | null
  content: string | null
  requiredRole: UserRole
  isPremium: boolean
  hasAccess: boolean
  isBookmarked: boolean
  viewCount: number
  userProgress: {
    id: string
    progress: number
    completedAt: Date | null
  } | null
  category: {
    name: string
  }
  relatedContent: Array<{
    id: string
    title: string
    type: ContentType
  }>
}

interface Props {
  contentId: string
  userId: string
}

export function ContentViewClient({ contentId, userId }: Props) {
  const router = useRouter()
  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarking, setBookmarking] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [contentId])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content/${contentId}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        router.push('/content-library')
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async () => {
    if (!content) return
    setBookmarking(true)
    try {
      const response = await fetch(`/api/content/${contentId}/bookmark`, {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setContent({ ...content, isBookmarked: data.bookmarked })
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setBookmarking(false)
    }
  }

  const markAsComplete = async () => {
    if (!content) return
    setMarkingComplete(true)
    try {
      const response = await fetch(`/api/content/${contentId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 100, completed: true }),
      })
      if (response.ok) {
        fetchContent() // Refresh to get updated progress
      }
    } catch (error) {
      console.error('Error marking as complete:', error)
    } finally {
      setMarkingComplete(false)
    }
  }

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'FRAMEWORK':
        return <Layers className="w-6 h-6" />
      case 'TEMPLATE':
        return <FileText className="w-6 h-6" />
      case 'WORKSHEET':
        return <FileText className="w-6 h-6" />
      case 'VIDEO':
        return <Video className="w-6 h-6" />
      case 'COURSE':
        return <Award className="w-6 h-6" />
      default:
        return <BookOpen className="w-6 h-6" />
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      FREE: { text: 'Free', color: 'bg-gray-100 text-gray-700', icon: '🎯' },
      UPGRADE: { text: 'Upgrade', color: 'bg-purple-100 text-purple-700', icon: '⭐' },
      MEMBER: { text: 'Member', color: 'bg-pink-100 text-pink-700', icon: '👑' },
    }
    return badges[role]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading content...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return null
  }

  const badge = getRoleBadge(content.requiredRole)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/content-library"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden">
          {/* Header Image/Thumbnail */}
          <div className="relative h-96 bg-gradient-to-br from-pink-100 to-purple-100">
            {content.thumbnail ? (
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">{getTypeIcon(content.type)}</div>
              </div>
            )}
            {!content.hasAccess && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Premium Content</h3>
                  <p className="text-lg mb-4">
                    Upgrade your membership to access this content
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    Upgrade Now
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="p-8">
            {/* Title & Meta */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                      {badge.icon} {badge.text}
                    </span>
                    <span className="text-sm text-gray-600">{content.category.name}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {content.viewCount} views
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{content.title}</h1>
                  {content.userProgress?.completedAt && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Completed
                    </div>
                  )}
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarking}
                  className={`p-3 rounded-lg transition-colors ${
                    content.isBookmarked
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Star
                    className={`w-6 h-6 ${content.isBookmarked ? 'fill-yellow-600' : ''}`}
                  />
                </button>
              </div>

              {/* Description */}
              {content.description && (
                <p className="text-lg text-gray-700 leading-relaxed">{content.description}</p>
              )}
            </div>

            {/* Progress Bar */}
            {content.hasAccess &&
              content.userProgress &&
              content.userProgress.progress > 0 &&
              !content.userProgress.completedAt && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Your Progress</span>
                    <span className="text-sm text-gray-600">{content.userProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${content.userProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            {content.hasAccess && (
              <div className="flex flex-wrap gap-4 mb-8">
                {content.fileUrl && (
                  <a
                    href={content.fileUrl}
                    download
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                )}
                {content.videoUrl && (
                  <a
                    href={content.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Watch Video
                  </a>
                )}
                {!content.userProgress?.completedAt && (
                  <button
                    onClick={markAsComplete}
                    disabled={markingComplete}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {markingComplete ? 'Marking...' : 'Mark as Complete'}
                  </button>
                )}
              </div>
            )}

            {/* Content Body */}
            {content.hasAccess && content.content && (
              <div className="prose max-w-none mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <div
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: content.content }}
                  />
                </div>
              </div>
            )}

            {/* Related Content */}
            {content.relatedContent && content.relatedContent.length > 0 && (
              <div className="border-t-2 border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Related Content
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {content.relatedContent.map((item) => (
                    <Link
                      key={item.id}
                      href={`/content-library/${item.id}`}
                      className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2 text-purple-600">
                        {getTypeIcon(item.type)}
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
