'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Image, Send, Clock, Instagram, Facebook, Linkedin, Share2, AlertCircle, Sparkles } from 'lucide-react'

interface SocialAccount {
  id: string
  platform: string
  accountName: string
  profileImage: string | null
  isActive: boolean
  tokenExpired: boolean
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Share2,
}

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'border-pink-500 bg-pink-500/10',
  facebook: 'border-blue-500 bg-blue-500/10',
  linkedin: 'border-blue-600 bg-blue-600/10',
  tiktok: 'border-gray-500 bg-gray-500/10',
}

export default function ComposePage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [content, setContent] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduleMode, setScheduleMode] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/social/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.filter((a: SocialAccount) => a.isActive && !a.tokenExpired))
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const getCharacterWarning = (platform: string) => {
    const limit = PLATFORM_LIMITS[platform]
    if (!limit) return null
    if (content.length > limit) {
      return { type: 'error', message: `${content.length - limit} characters over limit` }
    }
    if (content.length > limit * 0.9) {
      return { type: 'warning', message: `${limit - content.length} characters remaining` }
    }
    return null
  }

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!content.trim()) {
      alert('Please enter some content')
      return
    }
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    setSaving(true)
    try {
      let scheduledFor = null
      if (scheduleMode && scheduledDate && scheduledTime) {
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      }

      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
          platforms: selectedPlatforms,
          scheduledFor,
          status: publishNow ? 'draft' : (scheduledFor ? 'scheduled' : 'draft')
        })
      })

      if (response.ok) {
        const post = await response.json()

        if (publishNow) {
          // Publish immediately
          const publishResponse = await fetch(`/api/social/posts/${post.id}`, {
            method: 'POST'
          })
          if (publishResponse.ok) {
            router.push('/social/published')
          } else {
            alert('Failed to publish post')
          }
        } else if (scheduledFor) {
          router.push('/social/scheduled')
        } else {
          router.push('/social')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create post')
      }
    } catch (error) {
      alert('Failed to create post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  const availablePlatforms = [...new Set(accounts.map(a => a.platform))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-light-teal" size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Create Post</h2>
          <p className="text-sm text-gray-400 font-josefin">Compose and schedule your social media content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Selection */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Select Platforms</h3>

            {availablePlatforms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 font-josefin">No accounts connected</p>
                <button
                  onClick={() => router.push('/social/settings')}
                  className="mt-2 text-hot-pink font-josefin hover:underline"
                >
                  Connect an account
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availablePlatforms.map((platform) => {
                  const Icon = PLATFORM_ICONS[platform] || Share2
                  const isSelected = selectedPlatforms.includes(platform)
                  const colorClass = PLATFORM_COLORS[platform] || 'border-gray-500 bg-gray-500/10'

                  return (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-josefin ${
                        isSelected
                          ? colorClass
                          : 'border-white/10 bg-black/30 hover:border-white/20'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="capitalize">{platform}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-supernova text-light-teal">Content</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 font-josefin text-sm hover:bg-purple-500/30 transition-all">
                <Sparkles size={14} />
                AI Assist
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Write your post here..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal resize-none"
            />

            {/* Character Warnings */}
            <div className="mt-3 space-y-1">
              {selectedPlatforms.map((platform) => {
                const warning = getCharacterWarning(platform)
                if (!warning) return null
                return (
                  <div
                    key={platform}
                    className={`flex items-center gap-2 text-sm font-josefin ${
                      warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}
                  >
                    <AlertCircle size={14} />
                    <span className="capitalize">{platform}: {warning.message}</span>
                  </div>
                )
              })}
              <div className="text-xs text-gray-500 font-josefin">
                {content.length} characters
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Media</h3>

            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <Image className="mx-auto mb-3 text-gray-500" size={40} />
              <p className="text-gray-400 font-josefin mb-2">Drag and drop images here</p>
              <p className="text-xs text-gray-500 font-josefin">Or enter image URL below</p>

              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={mediaUrls[0] || ''}
                onChange={(e) => setMediaUrls(e.target.value ? [e.target.value] : [])}
                className="mt-4 w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white font-josefin text-sm focus:outline-none focus:border-light-teal"
              />
            </div>

            {selectedPlatforms.includes('instagram') && mediaUrls.length === 0 && (
              <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm font-josefin">
                <AlertCircle size={14} />
                Instagram requires an image to post
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview & Schedule */}
        <div className="space-y-6">
          {/* Schedule */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">When to Post</h3>

            <div className="space-y-3">
              <button
                onClick={() => setScheduleMode(false)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  !scheduleMode
                    ? 'border-hot-pink bg-hot-pink/10'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <Send size={18} />
                <span className="font-josefin">Post Now</span>
              </button>

              <button
                onClick={() => setScheduleMode(true)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  scheduleMode
                    ? 'border-hot-pink bg-hot-pink/10'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <Clock size={18} />
                <span className="font-josefin">Schedule for Later</span>
              </button>

              {scheduleMode && (
                <div className="space-y-3 pt-3">
                  <div>
                    <label className="block text-sm text-gray-400 font-josefin mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 font-josefin mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Preview</h3>

            <div className="p-4 rounded-lg bg-black/30 border border-white/10">
              {mediaUrls[0] && (
                <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-black/50">
                  <img
                    src={mediaUrls[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              <p className="text-white font-josefin text-sm whitespace-pre-wrap">
                {content || 'Your post content will appear here...'}
              </p>
              {selectedPlatforms.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                  {selectedPlatforms.map((platform) => {
                    const Icon = PLATFORM_ICONS[platform] || Share2
                    return <Icon key={platform} size={14} className="text-gray-400" />
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {scheduleMode ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving || !content.trim() || selectedPlatforms.length === 0 || !scheduledDate || !scheduledTime}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-purple-500 text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Clock size={18} />
                {saving ? 'Scheduling...' : 'Schedule Post'}
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving || !content.trim() || selectedPlatforms.length === 0}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-purple-500 text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {saving ? 'Publishing...' : 'Publish Now'}
              </button>
            )}

            <button
              onClick={() => handleSubmit(false)}
              disabled={saving || !content.trim() || selectedPlatforms.length === 0}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-josefin hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
