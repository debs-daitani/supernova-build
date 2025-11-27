'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2, ExternalLink, TrendingUp } from 'lucide-react'
import VENUEDLinkButton from './VENUEDLinkButton'

interface ConnectedApp {
  name: string
  status: 'active' | 'available' | 'inactive'
  url: string
  stats?: {
    projects?: number
    tasks?: number
    points?: number
    level?: number
  } | null
}

interface SSOStatusData {
  authenticated: boolean
  user: {
    id: string
    email: string
    name: string | null
  }
  connectedApps: ConnectedApp[]
}

/**
 * SSOStatus Component
 *
 * Displays current SSO connection status and linked applications
 * Shows stats for each connected app
 */
export default function SSOStatus() {
  const [status, setStatus] = useState<SSOStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/sso/status')

      if (!response.ok) {
        throw new Error('Failed to fetch SSO status')
      }

      const data = await response.json()
      setStatus(data)
    } catch (err: any) {
      console.error('SSO status error:', err)
      setError(err.message || 'Failed to load SSO status')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-light-teal" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-hot-pink/10 border border-hot-pink/30">
        <div className="flex items-center gap-3 mb-2">
          <XCircle className="w-5 h-5 text-hot-pink" />
          <h3 className="font-josefin font-bold text-hot-pink">Error Loading Status</h3>
        </div>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-light-teal/10 to-neon-lime/10 border border-light-teal/30">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-neon-lime" />
          <h3 className="font-josefin font-bold text-white text-lg">Authenticated</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-josefin text-gray-300">
            <span className="text-gray-400">Email:</span>{' '}
            <span className="text-white font-semibold">{status.user.email}</span>
          </p>
          {status.user.name && (
            <p className="text-sm font-josefin text-gray-300">
              <span className="text-gray-400">Name:</span>{' '}
              <span className="text-white font-semibold">{status.user.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Connected Apps */}
      <div>
        <h3 className="font-josefin font-bold text-white text-lg mb-4">Connected Applications</h3>
        <div className="space-y-4">
          {status.connectedApps.map((app) => (
            <div
              key={app.name}
              className={`p-6 rounded-xl backdrop-blur-xl border transition-all ${
                app.status === 'active'
                  ? 'bg-light-teal/10 border-light-teal/30'
                  : 'bg-charcoal/40 border-light-teal/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-josefin font-bold text-white">{app.name}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-josefin font-semibold ${
                        app.status === 'active'
                          ? 'bg-neon-lime/20 text-neon-lime'
                          : app.status === 'available'
                          ? 'bg-light-teal/20 text-light-teal'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* App Stats */}
                  {app.stats && app.status === 'active' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {app.stats.projects !== undefined && (
                        <div className="bg-charcoal/60 backdrop-blur-sm rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-400 font-josefin">Projects</p>
                          <p className="text-lg font-bold text-white">{app.stats.projects}</p>
                        </div>
                      )}
                      {app.stats.tasks !== undefined && (
                        <div className="bg-charcoal/60 backdrop-blur-sm rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-400 font-josefin">Tasks</p>
                          <p className="text-lg font-bold text-white">{app.stats.tasks}</p>
                        </div>
                      )}
                      {app.stats.points !== undefined && (
                        <div className="bg-charcoal/60 backdrop-blur-sm rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-400 font-josefin">Points</p>
                          <p className="text-lg font-bold text-neon-lime">{app.stats.points}</p>
                        </div>
                      )}
                      {app.stats.level !== undefined && (
                        <div className="bg-charcoal/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                          <div>
                            <p className="text-xs text-gray-400 font-josefin">Level</p>
                            <p className="text-lg font-bold text-light-teal">{app.stats.level}</p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-light-teal" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Launch Button */}
                {app.name === 'VENUED' && (
                  <div>
                    <VENUEDLinkButton variant="compact" />
                  </div>
                )}

                {app.name !== 'VENUED' && app.name !== 'SUPERNova AI' && (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-light-teal/20 hover:bg-light-teal/30 text-light-teal font-josefin font-semibold text-sm transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
