'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Share2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Music,
} from 'lucide-react'

interface Platform {
  id: string
  platform: 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK'
  isConnected: boolean
  platformUsername: string | null
  connectedAt: string | null
  tokenExpiresAt: string | null
}

const PLATFORM_INFO = {
  TWITTER: {
    name: 'Twitter / X',
    icon: Twitter,
    color: 'from-black to-gray-800',
    description: 'Share updates and engage with your audience on X',
  },
  LINKEDIN: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'from-blue-600 to-blue-700',
    description: 'Connect with professionals and share industry insights',
  },
  INSTAGRAM: {
    name: 'Instagram',
    icon: Instagram,
    color: 'from-purple-600 to-pink-600',
    description: 'Share visual content and stories with your followers',
  },
  FACEBOOK: {
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-500 to-blue-600',
    description: 'Reach your community with posts and updates',
  },
  TIKTOK: {
    name: 'TikTok',
    icon: Music,
    color: 'from-black to-gray-900',
    description: 'Create and share short-form video content',
  },
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [quota, setQuota] = useState({ current: 0, limit: 0, allowed: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/social/platforms')
      if (response.ok) {
        const data = await response.json()
        setPlatforms(data.platforms)
        setQuota(data.quota)
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error)
      setError('Failed to load platforms')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (platform: string) => {
    // TODO: Implement OAuth flow for each platform
    // This will redirect to platform OAuth URL and handle callback
    setError(`OAuth integration for ${platform} is not yet implemented. This requires platform-specific OAuth setup.`)
  }

  const handleDisconnect = async (platformId: string) => {
    if (!confirm('Are you sure you want to disconnect this platform?')) {
      return
    }

    try {
      const response = await fetch(`/api/social/platforms/${platformId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPlatforms()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to disconnect platform')
      }
    } catch (error) {
      console.error('Failed to disconnect platform:', error)
      setError('Failed to disconnect platform')
    }
  }

  const getPlatformStatus = (platformType: string) => {
    return platforms.find((p) => p.platform === platformType)
  }

  const isTokenExpiring = (platform: Platform) => {
    if (!platform.tokenExpiresAt) return false
    const expiryDate = new Date(platform.tokenExpiresAt)
    const now = new Date()
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilExpiry < 24 && hoursUntilExpiry > 0
  }

  const isTokenExpired = (platform: Platform) => {
    if (!platform.tokenExpiresAt) return false
    return new Date(platform.tokenExpiresAt) < new Date()
  }

  const quotaPercentage = quota.limit > 0 ? (quota.current / quota.limit) * 100 : 0
  const isNearLimit = quotaPercentage > 80

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Social Platforms</h1>
                <p className="text-gray-600">Connect your social media accounts</p>
              </div>
            </div>

            <Link
              href="/social/compose"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Compose Post
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Quota Display */}
        <div
          className={`rounded-xl shadow-md border-2 p-6 mb-8 ${
            isNearLimit ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Platform Quota</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {quota.current} / {quota.limit === Infinity ? '∞' : quota.limit}
            </span>
          </div>

          {quota.limit !== Infinity && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isNearLimit
                    ? 'bg-orange-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600'
                }`}
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              ></div>
            </div>
          )}

          {isNearLimit && quota.limit !== Infinity && (
            <p className="text-sm text-orange-700 mt-2">
              You're approaching your platform limit. Upgrade to BOLD or BADASS to connect more
              platforms.
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading platforms...</p>
          </div>
        )}

        {/* Platforms Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(PLATFORM_INFO).map(([key, info]) => {
              const Icon = info.icon
              const connectedPlatform = getPlatformStatus(key)
              const isConnected = connectedPlatform?.isConnected || false
              const isExpiring = connectedPlatform && isTokenExpiring(connectedPlatform)
              const isExpired = connectedPlatform && isTokenExpired(connectedPlatform)

              return (
                <div
                  key={key}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:border-purple-400 hover:shadow-lg transition-all"
                >
                  {/* Platform Header */}
                  <div className={`bg-gradient-to-r ${info.color} p-6 text-white`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-8 h-8" />
                      <h3 className="text-xl font-bold">{info.name}</h3>
                    </div>
                    <p className="text-sm opacity-90">{info.description}</p>
                  </div>

                  {/* Platform Body */}
                  <div className="p-6">
                    {/* Connection Status */}
                    <div className="mb-4">
                      {isConnected ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-700">Connected</span>
                          </div>
                          {connectedPlatform?.platformUsername && (
                            <p className="text-sm text-gray-600">
                              @{connectedPlatform.platformUsername}
                            </p>
                          )}
                          {connectedPlatform?.connectedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Since {new Date(connectedPlatform.connectedAt).toLocaleDateString()}
                            </p>
                          )}

                          {/* Token Status Warnings */}
                          {isExpired && (
                            <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Token expired - reconnect</span>
                            </div>
                          )}

                          {isExpiring && !isExpired && (
                            <div className="mt-3 flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Token expiring soon</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-500">Not Connected</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {!isConnected ? (
                        <button
                          onClick={() => handleConnect(key)}
                          disabled={!quota.allowed && !isConnected}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Connect {info.name}
                        </button>
                      ) : (
                        <>
                          {(isExpired || isExpiring) && (
                            <button
                              onClick={() => handleConnect(key)}
                              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            >
                              Reconnect
                            </button>
                          )}
                          <button
                            onClick={() => handleDisconnect(connectedPlatform!.id)}
                            className="w-full px-4 py-2 bg-white border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      )}

                      {!quota.allowed && !isConnected && (
                        <p className="text-xs text-gray-500 text-center">
                          Upgrade your plan to connect more platforms
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">OAuth Integration Required</h3>
          <p className="text-sm text-blue-800 mb-4">
            To connect social media platforms, you need to set up OAuth credentials for each
            platform in your application. This includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>Twitter: OAuth 2.0 with PKCE (Twitter Developer Portal)</li>
            <li>LinkedIn: OAuth 2.0 (LinkedIn Developers)</li>
            <li>Instagram: Facebook Graph API with Instagram Business Account</li>
            <li>Facebook: Facebook Graph API (Meta for Developers)</li>
            <li>TikTok: TikTok for Developers API</li>
          </ul>
          <p className="text-xs text-blue-700 mt-4">
            See implementation documentation for detailed OAuth setup instructions.
          </p>
        </div>
      </div>
    </div>
  )
}
