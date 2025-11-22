'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Calendar,
  Image as ImageIcon,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Music,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface Platform {
  id: string
  platform: 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK'
  isConnected: boolean
  platformUsername: string | null
}

const PLATFORM_INFO = {
  TWITTER: { name: 'Twitter / X', icon: Twitter, color: 'bg-black text-white', limit: 280 },
  LINKEDIN: { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600 text-white', limit: 3000 },
  INSTAGRAM: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white',
    limit: 2200,
  },
  FACEBOOK: { name: 'Facebook', icon: Facebook, color: 'bg-blue-500 text-white', limit: 63206 },
  TIKTOK: { name: 'TikTok', icon: Music, color: 'bg-black text-white', limit: 2200 },
}

export default function ComposePage() {
  const router = useRouter()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    content: '',
    selectedPlatforms: [] as string[],
    scheduledFor: '',
    mediaUrls: [] as string[],
  })

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/social/platforms')
      if (response.ok) {
        const data = await response.json()
        setPlatforms(data.platforms.filter((p: Platform) => p.isConnected))
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error)
    }
  }

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter((p) => p !== platform)
        : [...prev.selectedPlatforms, platform],
    }))
  }

  const getCharacterCount = (platform: string) => {
    const limit = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO]?.limit || 0
    const count = formData.content.length
    return { count, limit, remaining: limit - count, isValid: count <= limit }
  }

  const validatePost = () => {
    if (!formData.content.trim()) {
      setError('Post content is required')
      return false
    }

    if (formData.selectedPlatforms.length === 0) {
      setError('Select at least one platform')
      return false
    }

    // Check character limits
    const invalidPlatforms = formData.selectedPlatforms.filter((platform) => {
      const { isValid } = getCharacterCount(platform)
      return !isValid
    })

    if (invalidPlatforms.length > 0) {
      setError(
        `Content exceeds character limit for: ${invalidPlatforms
          .map((p) => PLATFORM_INFO[p as keyof typeof PLATFORM_INFO]?.name)
          .join(', ')}`
      )
      return false
    }

    return true
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    setError('')
    setSuccess('')

    if (!validatePost() && !isDraft) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.content,
          mediaUrls: formData.mediaUrls,
          platforms: formData.selectedPlatforms,
          scheduledFor: formData.scheduledFor || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      const post = await response.json()
      setSuccess(
        isDraft
          ? 'Draft saved successfully!'
          : formData.scheduledFor
          ? 'Post scheduled successfully!'
          : 'Post created as draft!'
      )

      setTimeout(() => {
        router.push('/social/posts')
      }, 1500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const connectedPlatforms = platforms.filter((p) => p.isConnected)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/social/posts"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Posts
          </Link>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
              <Send className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Compose Post</h1>
              <p className="text-gray-600">Create and schedule social media posts</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* No Platforms Warning */}
        {connectedPlatforms.length === 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-orange-900 mb-2">No Platforms Connected</h3>
                <p className="text-sm text-orange-800 mb-4">
                  You need to connect at least one social media platform before you can create
                  posts.
                </p>
                <Link
                  href="/social/platforms"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Connect Platforms
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Composer Form */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Platforms <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {connectedPlatforms.map((platform) => {
                const info = PLATFORM_INFO[platform.platform]
                const Icon = info.icon
                const isSelected = formData.selectedPlatforms.includes(platform.platform)

                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.platform)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {info.name.split(' ')[0]}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-purple-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 resize-none"
            />

            {/* Character Counters */}
            {formData.selectedPlatforms.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.selectedPlatforms.map((platform) => {
                  const { count, limit, remaining, isValid } = getCharacterCount(platform)
                  const info = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO]
                  const Icon = info.icon

                  return (
                    <div
                      key={platform}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isValid ? 'bg-gray-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{info.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isValid ? 'text-gray-600' : 'text-red-600'
                          }`}
                        >
                          {count} / {limit}
                        </span>
                        {isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Media URLs (Placeholder) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Media upload coming soon</p>
              <p className="text-xs text-gray-500">
                Image and video upload functionality will be implemented
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Schedule For (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to save as draft. Schedule for automatic posting.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || connectedPlatforms.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Creating...'
                : formData.scheduledFor
                ? 'Schedule Post'
                : 'Save as Draft'}
            </button>
            <Link
              href="/social/posts"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
