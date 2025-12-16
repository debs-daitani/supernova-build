'use client'

import { useState, useEffect } from 'react'
import { Instagram, Facebook, Linkedin, Share2, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface SocialAccount {
  id: string
  platform: string
  accountName: string
  profileImage?: string
  isActive: boolean
  expiresAt?: string
  createdAt: string
}

const PLATFORM_CONFIG = {
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 to-purple-500',
    description: 'Connect your Instagram Business account to publish photos and reels',
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-600 to-blue-500',
    description: 'Connect your Facebook Page to publish posts and engage with followers',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'from-blue-700 to-blue-600',
    description: 'Connect your LinkedIn profile to share professional updates',
  },
  tiktok: {
    name: 'TikTok',
    icon: Share2,
    color: 'from-black to-gray-800',
    description: 'Connect your TikTok account to publish videos',
  },
}

export default function SocialSettingsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/social/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectPlatform = async (platform: string) => {
    setConnecting(platform)
    try {
      const response = await fetch(`/api/social/accounts/connect/${platform}`)
      if (response.ok) {
        const data = await response.json()
        // Redirect to OAuth URL
        window.location.href = data.authUrl
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to initiate connection')
        setConnecting(null)
      }
    } catch (error) {
      alert('Failed to connect platform')
      setConnecting(null)
    }
  }

  const disconnectAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return

    setDisconnecting(accountId)
    try {
      const response = await fetch(`/api/social/accounts/${accountId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setAccounts(accounts.filter(a => a.id !== accountId))
      } else {
        alert('Failed to disconnect account')
      }
    } catch (error) {
      alert('Failed to disconnect account')
    } finally {
      setDisconnecting(null)
    }
  }

  const toggleAccountStatus = async (account: SocialAccount) => {
    try {
      const response = await fetch(`/api/social/accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !account.isActive }),
      })
      if (response.ok) {
        setAccounts(accounts.map(a =>
          a.id === account.id ? { ...a, isActive: !a.isActive } : a
        ))
      }
    } catch (error) {
      console.error('Failed to toggle account:', error)
    }
  }

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getAccountsByPlatform = (platform: string) => {
    return accounts.filter(a => a.platform === platform)
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-supernova text-light-teal">Connected Accounts</h2>
        <p className="text-sm text-gray-400 font-josefin">Manage your social media connections</p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => {
          const Icon = config.icon
          const platformAccounts = getAccountsByPlatform(platform)
          const hasAccount = platformAccounts.length > 0

          return (
            <div
              key={platform}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden"
            >
              {/* Platform Header */}
              <div className={`p-4 bg-gradient-to-r ${config.color}`}>
                <div className="flex items-center gap-3">
                  <Icon size={24} className="text-white" />
                  <div>
                    <h3 className="font-supernova text-white text-lg">{config.name}</h3>
                    <p className="text-white/80 text-xs font-josefin">{config.description}</p>
                  </div>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="p-4 space-y-3">
                {platformAccounts.map((account) => {
                  const expired = isTokenExpired(account.expiresAt)

                  return (
                    <div
                      key={account.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        expired
                          ? 'bg-red-500/10 border-red-500/30'
                          : account.isActive
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-gray-500/10 border-gray-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {account.profileImage ? (
                          <img
                            src={account.profileImage}
                            alt={account.accountName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Icon size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-josefin text-white">{account.accountName}</div>
                          <div className="flex items-center gap-2">
                            {expired ? (
                              <span className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                Token expired
                              </span>
                            ) : account.isActive ? (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Active
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Paused</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {expired && (
                          <button
                            onClick={() => connectPlatform(platform)}
                            disabled={connecting === platform}
                            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all"
                            title="Reconnect"
                          >
                            <RefreshCw size={16} className={connecting === platform ? 'animate-spin' : ''} />
                          </button>
                        )}
                        <button
                          onClick={() => toggleAccountStatus(account)}
                          className={`px-3 py-1.5 rounded-lg font-josefin text-xs transition-all ${
                            account.isActive
                              ? 'bg-white/10 text-gray-400 hover:bg-white/20'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {account.isActive ? 'Pause' : 'Enable'}
                        </button>
                        <button
                          onClick={() => disconnectAccount(account.id)}
                          disabled={disconnecting === account.id}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                          title="Disconnect"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Connect Button */}
                <button
                  onClick={() => connectPlatform(platform)}
                  disabled={connecting === platform}
                  className={`w-full p-3 rounded-lg border border-dashed border-white/20 text-gray-400 font-josefin hover:border-light-teal/50 hover:text-light-teal transition-all flex items-center justify-center gap-2 ${
                    connecting === platform ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {connecting === platform ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      {hasAccount ? 'Add Another Account' : 'Connect Account'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* OAuth Instructions */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
        <h3 className="font-supernova text-light-teal mb-4">Setup Instructions</h3>
        <div className="space-y-4 font-josefin text-gray-300 text-sm">
          <div>
            <h4 className="text-white font-medium mb-1">Instagram & Facebook</h4>
            <p className="text-gray-400">
              To connect Instagram, you need a Business or Creator account linked to a Facebook Page.
              Make sure you have admin access to the Facebook Page before connecting.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">LinkedIn</h4>
            <p className="text-gray-400">
              Connect your personal LinkedIn profile to share updates. Company pages require
              additional setup through LinkedIn's Marketing API.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">TikTok</h4>
            <p className="text-gray-400">
              TikTok integration requires a TikTok for Developers account. Video uploads
              must go through their Creator Tools for full functionality.
            </p>
          </div>
        </div>
      </div>

      {/* Environment Variables Notice */}
      <div className="backdrop-blur-xl bg-yellow-500/10 rounded-2xl border border-yellow-500/30 p-6">
        <h3 className="font-supernova text-yellow-400 mb-2">Developer Note</h3>
        <p className="font-josefin text-gray-300 text-sm">
          Social media OAuth requires the following environment variables to be configured:
        </p>
        <ul className="mt-3 space-y-1 font-mono text-xs text-gray-400">
          <li>• FACEBOOK_APP_ID, FACEBOOK_APP_SECRET</li>
          <li>• LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET</li>
          <li>• TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET</li>
          <li>• NEXT_PUBLIC_APP_URL (for OAuth redirects)</li>
        </ul>
      </div>
    </div>
  )
}
